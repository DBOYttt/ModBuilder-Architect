
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

    // Entity head size (8 pixels = 0.5 blocks)
    private readonly headScale = 0.5;

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
                // Create new mesh for this entity
                mesh = this.createEntityMesh(def);
                mesh.name = key;
                this.meshes.set(key, mesh);
                this.group.add(mesh);
            }

            // Update position (center on block, raise to sit on top of block below)
            mesh.position.set(
                entity.x + 0.5,
                entity.y + this.headScale / 2, // Sit on the ground
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

    private createEntityMesh(def: BlockDef): THREE.Mesh {
        // Create geometry with proper UVs for this entity
        const geometry = this.createEntityGeometry(def);
        const mesh = new THREE.Mesh(geometry, textureAtlas.getMaterial());
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    private createEntityGeometry(def: BlockDef): THREE.BufferGeometry {
        const size = this.headScale;
        const half = size / 2;

        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        // Get textures for each face
        const textures = def.textures;
        const faceTextures = [
            textures.front || textures.side,  // Front (+Z)
            textures.back || textures.side,   // Back (-Z)
            textures.top,                      // Top (+Y)
            textures.bottom,                   // Bottom (-Y)
            textures.right || textures.side,  // Right (+X)
            textures.left || textures.side,   // Left (-X)
        ];

        const faces = [
            // Front (positive Z)
            { verts: [[-half, -half, half], [half, -half, half], [half, half, half], [-half, half, half]], normal: [0, 0, 1] },
            // Back (negative Z)
            { verts: [[half, -half, -half], [-half, -half, -half], [-half, half, -half], [half, half, -half]], normal: [0, 0, -1] },
            // Top (positive Y)
            { verts: [[-half, half, half], [half, half, half], [half, half, -half], [-half, half, -half]], normal: [0, 1, 0] },
            // Bottom (negative Y)
            { verts: [[-half, -half, -half], [half, -half, -half], [half, -half, half], [-half, -half, half]], normal: [0, -1, 0] },
            // Right (positive X)
            { verts: [[half, -half, half], [half, -half, -half], [half, half, -half], [half, half, half]], normal: [1, 0, 0] },
            // Left (negative X)
            { verts: [[-half, -half, -half], [-half, -half, half], [-half, half, half], [-half, half, -half]], normal: [-1, 0, 0] },
        ];

        let vertIndex = 0;
        for (let i = 0; i < faces.length; i++) {
            const face = faces[i];
            const texName = faceTextures[i];

            for (const vert of face.verts) {
                positions.push(...vert);
                normals.push(...face.normal);
            }

            // Get UV coordinates for this texture
            let uv = textureAtlas.getUV(texName);
            if (!uv) uv = textureAtlas.getUV('MISSING');

            if (uv) {
                const eps = 0.5 / 2048;
                const uMin = uv.u + eps;
                const uMax = uv.u + uv.uSize - eps;
                const vMin = uv.v + eps;
                const vMax = uv.v + uv.vSize - eps;

                uvs.push(
                    uMin, vMin,
                    uMax, vMin,
                    uMax, vMax,
                    uMin, vMax
                );
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
