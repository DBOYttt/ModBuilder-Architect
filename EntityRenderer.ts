
import * as THREE from 'three';
import { textureAtlas } from './TextureAtlas';
import { BLOCKS } from './blocks';
import type { BlockDef } from './blocks';
import { getEntityModel, EntityModel, ModelPart } from './EntityModels';

export interface EntityInstance {
    x: number;
    y: number;
    z: number;
    blockId: number;
    rotation: number;
}

export class EntityRenderer {
    public group: THREE.Group;
    private meshes: Map<string, THREE.Group> = new Map();

    constructor() {
        this.group = new THREE.Group();
    }

    private getMeshKey(x: number, y: number, z: number): string {
        return `entity_${x}_${y}_${z}`;
    }

    public updateEntities(entities: EntityInstance[]) {
        const presentKeys = new Set<string>();

        for (const entity of entities) {
            if (!Number.isFinite(entity.x) || !Number.isFinite(entity.y) || !Number.isFinite(entity.z)) {
                continue;
            }

            const key = this.getMeshKey(entity.x, entity.y, entity.z);
            presentKeys.add(key);

            let entityGroup = this.meshes.get(key);
            const def = BLOCKS[entity.blockId];

            if (!def || def.group !== 'Entities') continue;

            if (!entityGroup) {
                entityGroup = this.createEntityModel(def);
                entityGroup.name = key;
                this.meshes.set(key, entityGroup);
                this.group.add(entityGroup);
            }

            // Position entity (center on block)
            entityGroup.position.set(
                entity.x + 0.5,
                entity.y,
                entity.z + 0.5
            );

            // Apply rotation
            const rotation = Number.isFinite(entity.rotation) ? entity.rotation : 0;
            entityGroup.rotation.y = (rotation * Math.PI) / 2;
        }

        // Remove old meshes
        for (const [key, entityGroup] of this.meshes) {
            if (!presentKeys.has(key)) {
                this.group.remove(entityGroup);
                this.disposeGroup(entityGroup);
                this.meshes.delete(key);
            }
        }
    }

    private createEntityModel(def: BlockDef): THREE.Group {
        const model = getEntityModel(def.name);
        const entityGroup = new THREE.Group();

        // Get the entity's texture name (stored in textures.side as path)
        const textureName = def.name;

        for (const part of model.parts) {
            const partMesh = this.createModelPart(part, model, textureName);
            if (partMesh) {
                entityGroup.add(partMesh);
            }
        }

        // Apply model scale
        entityGroup.scale.setScalar(model.scale);

        return entityGroup;
    }

    private createModelPart(part: ModelPart, model: EntityModel, textureName: string): THREE.Mesh | null {
        // Convert pixel dimensions to blocks (16 pixels = 1 block)
        const pixelToBlock = 1 / 16;

        const width = part.size[0] * pixelToBlock;
        const height = part.size[1] * pixelToBlock;
        const depth = part.size[2] * pixelToBlock;

        // Skip parts with zero dimensions
        if (width === 0 && height === 0 && depth === 0) return null;

        const geometry = this.createBoxGeometry(
            width, height, depth,
            part.uv[0], part.uv[1],
            part.size[0], part.size[1], part.size[2],
            model.textureWidth, model.textureHeight,
            part.mirror || false,
            textureName
        );

        const mesh = new THREE.Mesh(geometry, textureAtlas.getMaterial());
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = part.name;

        // Position the part
        mesh.position.set(
            part.origin[0],
            part.origin[1] + height / 2,
            part.origin[2]
        );

        // Apply rotation if specified
        if (part.rotation) {
            mesh.rotation.set(
                THREE.MathUtils.degToRad(part.rotation[0]),
                THREE.MathUtils.degToRad(part.rotation[1]),
                THREE.MathUtils.degToRad(part.rotation[2])
            );
        }

        return mesh;
    }

    private createBoxGeometry(
        width: number, height: number, depth: number,
        uvX: number, uvY: number,
        pixelWidth: number, pixelHeight: number, pixelDepth: number,
        texWidth: number, texHeight: number,
        mirror: boolean,
        textureName: string
    ): THREE.BufferGeometry {
        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        const hw = width / 2;
        const hh = height / 2;
        const hd = depth / 2;

        // Get the entity texture UV from atlas
        const atlasUV = textureAtlas.getUV(`${textureName}_entity`);

        // Calculate UV coordinates for each face based on Minecraft's box UV layout
        // Layout: [depth][width][depth][width] across top, then sides below
        const tw = texWidth;
        const th = texHeight;
        const pw = pixelWidth;
        const ph = pixelHeight;
        const pd = pixelDepth;

        // Face UV coordinates (in texture pixels)
        // Front face: (uvX + depth, uvY + depth) to (uvX + depth + width, uvY + depth + height)
        // Back face: (uvX + depth*2 + width, uvY + depth) to (uvX + depth*2 + width*2, uvY + depth + height)
        // Top face: (uvX + depth, uvY) to (uvX + depth + width, uvY + depth)
        // Bottom face: (uvX + depth + width, uvY) to (uvX + depth + width*2, uvY + depth)
        // Right face: (uvX, uvY + depth) to (uvX + depth, uvY + depth + height)
        // Left face: (uvX + depth + width, uvY + depth) to (uvX + depth*2 + width, uvY + depth + height)

        const faces = [
            // Front (+Z)
            {
                verts: [[-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd]],
                normal: [0, 0, 1],
                uvStart: [uvX + pd, uvY + pd],
                uvSize: [pw, ph]
            },
            // Back (-Z)
            {
                verts: [[hw, -hh, -hd], [-hw, -hh, -hd], [-hw, hh, -hd], [hw, hh, -hd]],
                normal: [0, 0, -1],
                uvStart: [uvX + pd * 2 + pw, uvY + pd],
                uvSize: [pw, ph]
            },
            // Top (+Y)
            {
                verts: [[-hw, hh, -hd], [hw, hh, -hd], [hw, hh, hd], [-hw, hh, hd]],
                normal: [0, 1, 0],
                uvStart: [uvX + pd, uvY],
                uvSize: [pw, pd]
            },
            // Bottom (-Y)
            {
                verts: [[-hw, -hh, hd], [hw, -hh, hd], [hw, -hh, -hd], [-hw, -hh, -hd]],
                normal: [0, -1, 0],
                uvStart: [uvX + pd + pw, uvY],
                uvSize: [pw, pd]
            },
            // Right (+X)
            {
                verts: [[hw, -hh, hd], [hw, -hh, -hd], [hw, hh, -hd], [hw, hh, hd]],
                normal: [1, 0, 0],
                uvStart: [uvX + pd + pw, uvY + pd],
                uvSize: [pd, ph]
            },
            // Left (-X)
            {
                verts: [[-hw, -hh, -hd], [-hw, -hh, hd], [-hw, hh, hd], [-hw, hh, -hd]],
                normal: [-1, 0, 0],
                uvStart: [uvX, uvY + pd],
                uvSize: [pd, ph]
            },
        ];

        let vertIndex = 0;
        for (const face of faces) {
            for (const vert of face.verts) {
                positions.push(...vert);
                normals.push(...face.normal);
            }

            // Calculate UVs
            if (atlasUV) {
                // Convert texture pixel coordinates to atlas UV coordinates
                const uStart = atlasUV.u + (face.uvStart[0] / tw) * atlasUV.uSize;
                const vStart = atlasUV.v + (1 - (face.uvStart[1] + face.uvSize[1]) / th) * atlasUV.vSize;
                const uEnd = atlasUV.u + ((face.uvStart[0] + face.uvSize[0]) / tw) * atlasUV.uSize;
                const vEnd = atlasUV.v + (1 - face.uvStart[1] / th) * atlasUV.vSize;

                const eps = 0.001;
                const u0 = uStart + eps;
                const u1 = uEnd - eps;
                const v0 = vStart + eps;
                const v1 = vEnd - eps;

                if (mirror) {
                    uvs.push(u1, v0, u0, v0, u0, v1, u1, v1);
                } else {
                    uvs.push(u0, v0, u1, v0, u1, v1, u0, v1);
                }
            } else {
                // Fallback - use MISSING texture
                const missing = textureAtlas.getUV('MISSING');
                if (missing) {
                    const u0 = missing.u;
                    const v0 = missing.v;
                    const u1 = missing.u + missing.uSize;
                    const v1 = missing.v + missing.vSize;
                    uvs.push(u0, v0, u1, v0, u1, v1, u0, v1);
                } else {
                    uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
                }
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

    private disposeGroup(group: THREE.Group) {
        group.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
            }
        });
    }

    public clear() {
        for (const entityGroup of this.meshes.values()) {
            this.group.remove(entityGroup);
            this.disposeGroup(entityGroup);
        }
        this.meshes.clear();
    }

    public dispose() {
        this.clear();
    }
}
