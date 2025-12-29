
import * as THREE from 'three';
import { textureAtlas } from './TextureAtlas';
import { BLOCKS } from './blocks';
import type { BlockDef } from './blocks';
import {
    getEntityModel,
    getEntityModelAsync,
    loadEntityBedrockModel,
    EntityModel,
    ModelPart
} from './EntityModels';

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
    private pendingModels = new Map<string, boolean>();

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
                // Create entity model synchronously (uses cached Bedrock model if available)
                entityGroup = this.createEntityModel(def);
                entityGroup.name = key;
                this.meshes.set(key, entityGroup);
                this.group.add(entityGroup);

                // Try to load Bedrock model asynchronously and update if needed
                this.loadBedrockModelAsync(def, entityGroup, key);
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
                this.pendingModels.delete(key);
            }
        }
    }

    private async loadBedrockModelAsync(def: BlockDef, entityGroup: THREE.Group, key: string) {
        // Skip if already loading or loaded
        if (this.pendingModels.get(key)) {
            return;
        }

        this.pendingModels.set(key, true);

        try {
            // Ensure entity texture is loaded first
            const texturePath = def.textures.side;
            await textureAtlas.loadEntitySkin(def.name, texturePath);

            // Try to load the Bedrock model
            const bedrockModel = await loadEntityBedrockModel(def.name);

            // Check if entity still exists and needs updating
            if (!bedrockModel || !this.meshes.has(key)) {
                return;
            }

            // Get current position and rotation before replacing
            const position = entityGroup.position.clone();
            const rotation = entityGroup.rotation.clone();
            const scale = entityGroup.scale.clone();

            // Recreate entity model with Bedrock data
            const newEntityGroup = this.createEntityModelFromModel(bedrockModel, def.name);
            newEntityGroup.name = key;
            newEntityGroup.position.copy(position);
            newEntityGroup.rotation.copy(rotation);
            newEntityGroup.scale.copy(scale);

            // Replace the old model
            this.group.remove(entityGroup);
            this.disposeGroup(entityGroup);
            this.meshes.set(key, newEntityGroup);
            this.group.add(newEntityGroup);

            console.log(`Updated ${def.name} at ${key} with Bedrock model`);
        } catch (error) {
            console.warn(`Failed to load Bedrock model for ${def.name}:`, error);
        } finally {
            this.pendingModels.delete(key);
        }
    }

    private createEntityModel(def: BlockDef): THREE.Group {
        const model = getEntityModel(def.name);
        return this.createEntityModelFromModel(model, def.name);
    }

    private createEntityModelFromModel(model: EntityModel, entityName: string): THREE.Group {
        const entityGroup = new THREE.Group();

        // Get the entity's texture name (stored in textures.side as path)
        const textureName = entityName;

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
            textureName,
            part.perFaceUV
        );

        const mesh = new THREE.Mesh(geometry, textureAtlas.getMaterial());
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = part.name;

        // Position the part
        // For Bedrock models, the origin is already the center position
        // For legacy models, we need to adjust by height/2
        // We'll just use origin directly as BedrockModelLoader already computes center
        mesh.position.set(
            part.origin[0],
            part.origin[1],
            part.origin[2]
        );

        // Apply rotation if specified
        if (part.rotation) {
            // Handle pivot point for rotation
            if (part.pivot) {
                // Create a pivot group for proper rotation around pivot point
                const pivotGroup = new THREE.Group();

                // Position the pivot group at the pivot point
                pivotGroup.position.set(
                    part.pivot[0],
                    part.pivot[1],
                    part.pivot[2]
                );

                // Position mesh relative to pivot (offset from pivot)
                mesh.position.set(
                    part.origin[0] - part.pivot[0],
                    part.origin[1] - part.pivot[1],
                    part.origin[2] - part.pivot[2]
                );

                // Apply rotation to the pivot group, not the mesh
                // This ensures rotation happens around the pivot point
                pivotGroup.rotation.set(
                    THREE.MathUtils.degToRad(part.rotation[0]),
                    THREE.MathUtils.degToRad(part.rotation[1]),
                    THREE.MathUtils.degToRad(part.rotation[2])
                );

                pivotGroup.add(mesh);
                return pivotGroup as unknown as THREE.Mesh;
            } else {
                // No pivot - rotate around mesh center
                mesh.rotation.set(
                    THREE.MathUtils.degToRad(part.rotation[0]),
                    THREE.MathUtils.degToRad(part.rotation[1]),
                    THREE.MathUtils.degToRad(part.rotation[2])
                );
            }
        }

        return mesh;
    }

    private createBoxGeometry(
        width: number, height: number, depth: number,
        uvX: number, uvY: number,
        pixelWidth: number, pixelHeight: number, pixelDepth: number,
        texWidth: number, texHeight: number,
        mirror: boolean,
        textureName: string,
        perFaceUV?: import('./EntityModels').PerFaceUV
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

        // Default box UV layout faces
        const defaultFaces = [
            // Front (+Z) - corresponds to "south" in Minecraft
            {
                verts: [[-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd]],
                normal: [0, 0, 1],
                uvStart: [uvX + pd, uvY + pd],
                uvSize: [pw, ph],
                faceKey: 'south' as const
            },
            // Back (-Z) - corresponds to "north" in Minecraft
            {
                verts: [[hw, -hh, -hd], [-hw, -hh, -hd], [-hw, hh, -hd], [hw, hh, -hd]],
                normal: [0, 0, -1],
                uvStart: [uvX + pd * 2 + pw, uvY + pd],
                uvSize: [pw, ph],
                faceKey: 'north' as const
            },
            // Top (+Y) - corresponds to "up" in Minecraft
            {
                verts: [[-hw, hh, -hd], [hw, hh, -hd], [hw, hh, hd], [-hw, hh, hd]],
                normal: [0, 1, 0],
                uvStart: [uvX + pd, uvY],
                uvSize: [pw, pd],
                faceKey: 'up' as const
            },
            // Bottom (-Y) - corresponds to "down" in Minecraft
            {
                verts: [[-hw, -hh, hd], [hw, -hh, hd], [hw, -hh, -hd], [-hw, -hh, -hd]],
                normal: [0, -1, 0],
                uvStart: [uvX + pd + pw, uvY],
                uvSize: [pw, pd],
                faceKey: 'down' as const
            },
            // Right (+X) - corresponds to "east" in Minecraft
            {
                verts: [[hw, -hh, hd], [hw, -hh, -hd], [hw, hh, -hd], [hw, hh, hd]],
                normal: [1, 0, 0],
                uvStart: [uvX + pd + pw, uvY + pd],
                uvSize: [pd, ph],
                faceKey: 'east' as const
            },
            // Left (-X) - corresponds to "west" in Minecraft
            {
                verts: [[-hw, -hh, -hd], [-hw, -hh, hd], [-hw, hh, hd], [-hw, hh, -hd]],
                normal: [-1, 0, 0],
                uvStart: [uvX, uvY + pd],
                uvSize: [pd, ph],
                faceKey: 'west' as const
            },
        ];

        // Override with per-face UV if provided
        const faces = defaultFaces.map(face => {
            if (perFaceUV && perFaceUV[face.faceKey]) {
                const faceData = perFaceUV[face.faceKey]!;
                return {
                    ...face,
                    uvStart: faceData.uv,
                    uvSize: faceData.uv_size[0] !== 0 || faceData.uv_size[1] !== 0
                        ? faceData.uv_size
                        : face.uvSize // fallback to calculated size if uv_size is [0,0]
                };
            }
            return face;
        });

        let vertIndex = 0;
        for (const face of faces) {
            for (const vert of face.verts) {
                positions.push(...vert);
                normals.push(...face.normal);
            }

            // Calculate UVs
            if (atlasUV) {
                // Convert texture pixel coordinates to atlas UV coordinates
                // atlasUV.v is the bottom of the texture region in OpenGL coords
                // atlasUV.vSize is the height going upward

                // Map texture pixel coords to [0,1] range within texture
                const localU0 = face.uvStart[0] / tw;
                const localU1 = (face.uvStart[0] + face.uvSize[0]) / tw;
                // Y axis is inverted: texture pixel 0 is at top, but atlas.v is at bottom
                const localV0 = 1 - (face.uvStart[1] + face.uvSize[1]) / th;
                const localV1 = 1 - face.uvStart[1] / th;

                // Map to atlas coordinates
                const uStart = atlasUV.u + localU0 * atlasUV.uSize;
                const uEnd = atlasUV.u + localU1 * atlasUV.uSize;
                const vStart = atlasUV.v + localV0 * atlasUV.vSize;
                const vEnd = atlasUV.v + localV1 * atlasUV.vSize;

                // Epsilon to prevent texture bleeding (0.5 pixels in atlas space)
                // Using same value as block textures for consistency
                const eps = 0.5 / 2048;
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

    /**
     * Preload Bedrock models for common entities
     * Call this during initialization to avoid loading delays
     */
    public async preloadCommonEntities(): Promise<void> {
        const commonEntities = [
            'Zombie', 'Skeleton', 'Creeper', 'Spider', 'Enderman',
            'Pig', 'Cow', 'Sheep', 'Chicken', 'Wolf'
        ];

        console.log('Preloading common entity Bedrock models...');
        const promises = commonEntities.map(name => loadEntityBedrockModel(name));
        await Promise.allSettled(promises);
        console.log('Finished preloading entity models');
    }
}
