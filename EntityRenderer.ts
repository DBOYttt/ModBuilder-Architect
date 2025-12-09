
import * as THREE from 'three';
import { textureAtlas } from './TextureAtlas';
import { BLOCKS } from './blocks';
import type { BlockDef } from './blocks';

export interface EntityInstance {
    x: number;
    y: number;
    z: number;
    blockId: number;
    rotation: number;
}

export class EntityRenderer {
    public group: THREE.Group;
    private meshes: Map<string, THREE.Mesh> = new Map();

    // Banner dimensions (width x height in blocks)
    private readonly bannerWidth = 0.875;  // Slightly less than 1 block wide
    private readonly bannerHeight = 1.5;   // 1.5 blocks tall
    private readonly bannerThickness = 0.0625; // Very thin (1 pixel thickness)

    constructor() {
        this.group = new THREE.Group();
    }

    private getMeshKey(x: number, y: number, z: number): string {
        return `entity_${x}_${y}_${z}`;
    }

    public updateEntities(entities: EntityInstance[]) {
        // Track which entities are still present
        const presentKeys = new Set<string>();

        for (const entity of entities) {
            // Validate entity position
            if (!Number.isFinite(entity.x) || !Number.isFinite(entity.y) || !Number.isFinite(entity.z)) {
                console.warn('Entity has invalid position:', entity);
                continue;
            }

            const key = this.getMeshKey(entity.x, entity.y, entity.z);
            presentKeys.add(key);

            let mesh = this.meshes.get(key);
            const def = BLOCKS[entity.blockId];

            if (!def) {
                console.warn(`Entity at (${entity.x}, ${entity.y}, ${entity.z}) has invalid blockId: ${entity.blockId}`);
                continue;
            }

            if (def.group !== 'Entities') continue;

            if (!mesh) {
                // Create new banner mesh for this entity
                mesh = this.createBannerMesh(def);
                mesh.name = key;
                this.meshes.set(key, mesh);
                this.group.add(mesh);
            }

            // Update position (center on block, banner base sits on ground)
            mesh.position.set(
                entity.x + 0.5,
                entity.y,
                entity.z + 0.5
            );

            // Update rotation (validate rotation value)
            const rotation = Number.isFinite(entity.rotation) ? entity.rotation : 0;
            mesh.rotation.y = (rotation * Math.PI) / 2;
        }

        // Remove meshes that are no longer present
        for (const [key, mesh] of this.meshes) {
            if (!presentKeys.has(key)) {
                this.group.remove(mesh);
                mesh.geometry.dispose();
                this.meshes.delete(key);
            }
        }
    }

    private createBannerMesh(def: BlockDef): THREE.Mesh {
        // Create banner geometry with proper UVs
        const geometry = this.createBannerGeometry(def);
        const mesh = new THREE.Mesh(geometry, textureAtlas.getMaterial());
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    private createBannerGeometry(def: BlockDef): THREE.BufferGeometry {
        const w = this.bannerWidth / 2;   // Half width
        const h = this.bannerHeight;       // Full height
        const t = this.bannerThickness / 2; // Half thickness

        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        // Get the front texture for the banner (use front face texture)
        const frontTex = def.textures.front || def.textures.side;
        const backTex = def.textures.back || def.textures.side;

        // Banner is a thin box with front and back faces showing the entity texture
        // Side edges are very thin

        const faces = [
            // Front face (positive Z) - main display
            {
                verts: [[-w, 0, t], [w, 0, t], [w, h, t], [-w, h, t]],
                normal: [0, 0, 1],
                tex: frontTex
            },
            // Back face (negative Z) - mirrored display
            {
                verts: [[w, 0, -t], [-w, 0, -t], [-w, h, -t], [w, h, -t]],
                normal: [0, 0, -1],
                tex: backTex,
                flipU: true // Mirror the texture on back
            },
            // Top edge (positive Y)
            {
                verts: [[-w, h, t], [w, h, t], [w, h, -t], [-w, h, -t]],
                normal: [0, 1, 0],
                tex: def.textures.top,
                isEdge: true
            },
            // Bottom edge (negative Y)
            {
                verts: [[-w, 0, -t], [w, 0, -t], [w, 0, t], [-w, 0, t]],
                normal: [0, -1, 0],
                tex: def.textures.bottom,
                isEdge: true
            },
            // Right edge (positive X)
            {
                verts: [[w, 0, t], [w, 0, -t], [w, h, -t], [w, h, t]],
                normal: [1, 0, 0],
                tex: frontTex,
                isEdge: true
            },
            // Left edge (negative X)
            {
                verts: [[-w, 0, -t], [-w, 0, t], [-w, h, t], [-w, h, -t]],
                normal: [-1, 0, 0],
                tex: frontTex,
                isEdge: true
            },
        ];

        let vertIndex = 0;
        for (const face of faces) {
            for (const vert of face.verts) {
                positions.push(...vert);
                normals.push(...face.normal);
            }

            // Get UV coordinates for this texture
            let uv = textureAtlas.getUV(face.tex);
            if (!uv) uv = textureAtlas.getUV('MISSING');

            if (uv) {
                const eps = 0.5 / 2048;
                const uMin = uv.u + eps;
                const uMax = uv.u + uv.uSize - eps;
                const vMin = uv.v + eps;
                const vMax = uv.v + uv.vSize - eps;

                if ((face as any).flipU) {
                    // Mirror horizontally for back face
                    uvs.push(
                        uMax, vMin,
                        uMin, vMin,
                        uMin, vMax,
                        uMax, vMax
                    );
                } else if ((face as any).isEdge) {
                    // For thin edges, use a small strip of the texture
                    const edgeU = uMin + (uMax - uMin) * 0.5;
                    uvs.push(
                        edgeU, vMin,
                        edgeU, vMin,
                        edgeU, vMax,
                        edgeU, vMax
                    );
                } else {
                    uvs.push(
                        uMin, vMin,
                        uMax, vMin,
                        uMax, vMax,
                        uMin, vMax
                    );
                }
            } else {
                uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
            }

            indices.push(
                vertIndex, vertIndex + 1, vertIndex + 2,
                vertIndex + 2, vertIndex + 3, vertIndex
            );
            vertIndex += 4;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeBoundingSphere();

        return geometry;
    }

    public clear() {
        for (const mesh of this.meshes.values()) {
            this.group.remove(mesh);
            mesh.geometry.dispose();
        }
        this.meshes.clear();
    }

    public dispose() {
        this.clear();
    }
}
