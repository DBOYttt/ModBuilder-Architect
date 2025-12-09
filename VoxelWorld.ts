
import * as THREE from 'three';
import { textureAtlas } from './TextureAtlas';
import { BLOCKS } from './blocks';
import type { BlockDef } from './blocks';

export { BLOCKS };
export type { BlockDef };

export const CHUNK_SIZE = 16;

export type BlockId = number;

export class VoxelWorld {
    // Upgraded to Uint16 to support > 255 block types
    public chunks: Map<string, Uint16Array>;
    // Metadata storage (Rotation: 2 bits)
    public chunkMetadata: Map<string, Uint8Array>;
    
    public meshes: Map<string, THREE.Mesh>;
    public group: THREE.Group;
    private layerLimit: number = 256;
    private layerLimitEnabled: boolean = false;
    
    // Tracking
    private blockCounts: Map<number, number> = new Map();
    private listeners: (() => void)[] = [];

    // Batching
    private isBatching: boolean = false;
    private dirtyChunks: Set<string> = new Set();

    constructor() {
        this.chunks = new Map();
        this.chunkMetadata = new Map();
        this.meshes = new Map();
        this.group = new THREE.Group();
    }

    // --- Event System ---
    public addChangeListener(callback: () => void) {
        this.listeners.push(callback);
    }

    public removeChangeListener(callback: () => void) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    private notifyListeners() {
        this.listeners.forEach(l => l());
    }

    public getBlockCounts(): Map<number, number> {
        return this.blockCounts;
    }

    // --- Batching System ---
    public beginBatch() {
        this.isBatching = true;
        this.dirtyChunks.clear();
    }

    public endBatch() {
        this.isBatching = false;
        this.dirtyChunks.forEach(chunkId => {
            const parts = chunkId.split(',').map(Number);
            this.updateChunkGeometry(parts[0], parts[1], parts[2]);
        });
        this.dirtyChunks.clear();
        this.notifyListeners();
    }

    private computeChunkId(x: number, y: number, z: number): string {
        return `${x},${y},${z}`;
    }

    private getChunk(cx: number, cy: number, cz: number): Uint16Array | undefined {
        return this.chunks.get(this.computeChunkId(cx, cy, cz));
    }

    private getChunkMetadata(cx: number, cy: number, cz: number): Uint8Array | undefined {
        return this.chunkMetadata.get(this.computeChunkId(cx, cy, cz));
    }

    private createChunk(cx: number, cy: number, cz: number): Uint16Array {
        const id = this.computeChunkId(cx, cy, cz);
        const chunk = new Uint16Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);
        const meta = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE * CHUNK_SIZE);
        this.chunks.set(id, chunk);
        this.chunkMetadata.set(id, meta);
        return chunk;
    }

    public getChunkKey(x: number, y: number, z: number): string {
        const cx = Math.floor(x / CHUNK_SIZE);
        const cy = Math.floor(y / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        return this.computeChunkId(cx, cy, cz);
    }

    public clear() {
        this.chunks.clear();
        this.chunkMetadata.clear();
        this.meshes.forEach(mesh => {
            this.group.remove(mesh);
            mesh.geometry.dispose();
        });
        this.meshes.clear();
        this.blockCounts.clear();
        this.notifyListeners();
    }

    public getAllBlocks(): {x: number, y: number, z: number, id: number, rotation: number}[] {
        const blocks: {x: number, y: number, z: number, id: number, rotation: number}[] = [];
        this.chunks.forEach((chunk, key) => {
            const meta = this.chunkMetadata.get(key);
            const parts = key.split(',').map(Number);
            const cx = parts[0];
            const cy = parts[1];
            const cz = parts[2];

            for(let i=0; i<chunk.length; i++) {
                if(chunk[i] !== 0) {
                     const ly = Math.floor(i / (CHUNK_SIZE * CHUNK_SIZE));
                     const rem = i % (CHUNK_SIZE * CHUNK_SIZE);
                     const lz = Math.floor(rem / CHUNK_SIZE);
                     const lx = rem % CHUNK_SIZE;

                     blocks.push({
                         x: cx * CHUNK_SIZE + lx,
                         y: cy * CHUNK_SIZE + ly,
                         z: cz * CHUNK_SIZE + lz,
                         id: chunk[i],
                         rotation: meta ? meta[i] : 0
                     });
                }
            }
        });
        return blocks;
    }

    public getEntityInstances(): {x: number, y: number, z: number, blockId: number, rotation: number}[] {
        const entities: {x: number, y: number, z: number, blockId: number, rotation: number}[] = [];
        this.chunks.forEach((chunk, key) => {
            const meta = this.chunkMetadata.get(key);
            const parts = key.split(',').map(Number);
            const cx = parts[0];
            const cy = parts[1];
            const cz = parts[2];

            for(let i=0; i<chunk.length; i++) {
                const blockId = chunk[i];
                if(blockId !== 0) {
                    const def = BLOCKS[blockId];
                    if (def && def.group === 'Entities') {
                        const ly = Math.floor(i / (CHUNK_SIZE * CHUNK_SIZE));
                        const rem = i % (CHUNK_SIZE * CHUNK_SIZE);
                        const lz = Math.floor(rem / CHUNK_SIZE);
                        const lx = rem % CHUNK_SIZE;

                        entities.push({
                            x: cx * CHUNK_SIZE + lx,
                            y: cy * CHUNK_SIZE + ly,
                            z: cz * CHUNK_SIZE + lz,
                            blockId,
                            rotation: meta ? meta[i] : 0
                        });
                    }
                }
            }
        });
        return entities;
    }

    public getMaxLayer(): number {
        let maxY = 0;
        for (const key of this.chunks.keys()) {
            const parts = key.split(',');
            const cy = parseInt(parts[1], 10);
            const chunk = this.chunks.get(key);
            if (chunk) {
                for (let i = chunk.length - 1; i >= 0; i--) {
                    if (chunk[i] !== 0) {
                        const ly = Math.floor(i / (CHUNK_SIZE * CHUNK_SIZE));
                        const worldY = cy * CHUNK_SIZE + ly;
                        if (worldY > maxY) maxY = worldY;
                        break; 
                    }
                }
            }
        }
        return maxY;
    }

    public getBlock(x: number, y: number, z: number): number {
        const cx = Math.floor(x / CHUNK_SIZE);
        const cy = Math.floor(y / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);

        const chunk = this.getChunk(cx, cy, cz);
        if (!chunk) return 0;

        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const ly = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const index = lx + lz * CHUNK_SIZE + ly * CHUNK_SIZE * CHUNK_SIZE;
        return chunk[index];
    }
    
    public getBlockRotation(x: number, y: number, z: number): number {
        const cx = Math.floor(x / CHUNK_SIZE);
        const cy = Math.floor(y / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);
        
        const meta = this.getChunkMetadata(cx, cy, cz);
        if (!meta) return 0;
        
        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const ly = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        
        const index = lx + lz * CHUNK_SIZE + ly * CHUNK_SIZE * CHUNK_SIZE;
        return meta[index] & 0x03; // First 2 bits
    }

    public placeBlock(x: number, y: number, z: number, blockId: number, rotation: number = 0) {
        const cx = Math.floor(x / CHUNK_SIZE);
        const cy = Math.floor(y / CHUNK_SIZE);
        const cz = Math.floor(z / CHUNK_SIZE);

        let chunk = this.getChunk(cx, cy, cz);
        let meta = this.getChunkMetadata(cx, cy, cz);
        
        if (!chunk) {
            chunk = this.createChunk(cx, cy, cz);
            meta = this.getChunkMetadata(cx, cy, cz)!;
        }

        const lx = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const ly = ((y % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
        const lz = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

        const index = lx + lz * CHUNK_SIZE + ly * CHUNK_SIZE * CHUNK_SIZE;
        
        // Count Updates
        const oldBlockId = chunk[index];
        if (oldBlockId !== blockId || (meta && meta[index] !== rotation)) {
            // Decrement old
            if (oldBlockId !== 0) {
                const count = this.blockCounts.get(oldBlockId) || 0;
                if (count > 1) {
                    this.blockCounts.set(oldBlockId, count - 1);
                } else {
                    this.blockCounts.delete(oldBlockId);
                }
            }
            // Increment new
            if (blockId !== 0) {
                const count = this.blockCounts.get(blockId) || 0;
                this.blockCounts.set(blockId, count + 1);
            }

            chunk[index] = blockId;
            if (meta) meta[index] = rotation;

            if (this.isBatching) {
                this.dirtyChunks.add(this.computeChunkId(cx, cy, cz));
                if (lx === 0) this.dirtyChunks.add(this.computeChunkId(cx - 1, cy, cz));
                if (lx === CHUNK_SIZE - 1) this.dirtyChunks.add(this.computeChunkId(cx + 1, cy, cz));
                if (ly === 0) this.dirtyChunks.add(this.computeChunkId(cx, cy - 1, cz));
                if (ly === CHUNK_SIZE - 1) this.dirtyChunks.add(this.computeChunkId(cx, cy + 1, cz));
                if (lz === 0) this.dirtyChunks.add(this.computeChunkId(cx, cy, cz - 1));
                if (lz === CHUNK_SIZE - 1) this.dirtyChunks.add(this.computeChunkId(cx, cy, cz + 1));
            } else {
                // Update this chunk
                this.updateChunkGeometry(cx, cy, cz);

                // Update neighbor chunks if we are on the edge
                if (lx === 0) this.updateChunkGeometry(cx - 1, cy, cz);
                if (lx === CHUNK_SIZE - 1) this.updateChunkGeometry(cx + 1, cy, cz);
                if (ly === 0) this.updateChunkGeometry(cx, cy - 1, cz);
                if (ly === CHUNK_SIZE - 1) this.updateChunkGeometry(cx, cy + 1, cz);
                if (lz === 0) this.updateChunkGeometry(cx, cy, cz - 1);
                if (lz === CHUNK_SIZE - 1) this.updateChunkGeometry(cx, cy, cz + 1);

                this.notifyListeners();
            }
        }
    }

    public removeBlock(x: number, y: number, z: number) {
        this.placeBlock(x, y, z, 0);
    }

    public setLayerLimit(limit: number, enabled: boolean) {
        if (this.layerLimit === limit && this.layerLimitEnabled === enabled) return;
        this.layerLimit = limit;
        this.layerLimitEnabled = enabled;
        this.updateAllChunks();
    }

    public updateAllChunks() {
        for (const key of this.chunks.keys()) {
            const parts = key.split(',').map(Number);
            this.updateChunkGeometry(parts[0], parts[1], parts[2]);
        }
    }

    private updateChunkGeometry(cx: number, cy: number, cz: number) {
        const chunkId = this.computeChunkId(cx, cy, cz);
        const chunk = this.getChunk(cx, cy, cz);
        const meta = this.getChunkMetadata(cx, cy, cz);

        if (!chunk) {
            const mesh = this.meshes.get(chunkId);
            if (mesh) {
                this.group.remove(mesh);
                mesh.geometry.dispose();
                this.meshes.delete(chunkId);
            }
            return;
        }

        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const indices: number[] = [];

        let vertexCount = 0;

        const startX = cx * CHUNK_SIZE;
        const startY = cy * CHUNK_SIZE;
        const startZ = cz * CHUNK_SIZE;

        for (let y = 0; y < CHUNK_SIZE; y++) {
            const worldY = startY + y;
            if (this.layerLimitEnabled && worldY > this.layerLimit) continue;

            for (let z = 0; z < CHUNK_SIZE; z++) {
                for (let x = 0; x < CHUNK_SIZE; x++) {
                    const index = x + z * CHUNK_SIZE + y * CHUNK_SIZE * CHUNK_SIZE;
                    const blockId = chunk[index];

                    if (blockId === 0) continue;

                    const worldX = startX + x;
                    const worldZ = startZ + z;
                    const def = BLOCKS[blockId];
                    if (!def) continue;

                    // Skip entities - they are rendered separately by EntityRenderer
                    if (def.group === 'Entities') continue;

                    const rotation = meta ? (meta[index] & 0x03) : 0;

                    let texTop = def.textures.top;
                    let texBottom = def.textures.bottom;
                    let texFront = def.textures.front || def.textures.side;
                    let texBack = def.textures.back || def.textures.side;
                    let texLeft = def.textures.left || def.textures.side;
                    let texRight = def.textures.right || def.textures.side;
                    
                    let physPZ = texFront; // South Face
                    let physNZ = texBack;  // North Face
                    let physPX = texRight; // East Face
                    let physNX = texLeft;  // West Face
                    
                    if (rotation === 1) { // 90 deg (Face West)
                        physNX = texFront;
                        physPX = texBack;
                        physPZ = texRight;
                        physNZ = texLeft;
                    } else if (rotation === 2) { // 180 deg (Face North)
                        physNZ = texFront;
                        physPZ = texBack;
                        physNX = texRight;
                        physPX = texLeft;
                    } else if (rotation === 3) { // 270 deg (Face East)
                        physPX = texFront;
                        physNX = texBack;
                        physNZ = texRight;
                        physPZ = texLeft;
                    }

                    // px (Right, X+)
                    if (this.isTransparent(worldX + 1, worldY, worldZ)) {
                        this.addFace(positions, normals, uvs, indices, vertexCount, [1, 0, 0], 
                            [worldX + 1, worldY, worldZ + 1], [worldX + 1, worldY, worldZ], [worldX + 1, worldY + 1, worldZ], [worldX + 1, worldY + 1, worldZ + 1], 
                            physPX, rotation, false 
                        );
                        vertexCount += 4;
                    }
                    // nx (Left, X-)
                    if (this.isTransparent(worldX - 1, worldY, worldZ)) {
                        this.addFace(positions, normals, uvs, indices, vertexCount, [-1, 0, 0], 
                            [worldX, worldY, worldZ], [worldX, worldY, worldZ + 1], [worldX, worldY + 1, worldZ + 1], [worldX, worldY + 1, worldZ], 
                            physNX, rotation, false
                        );
                        vertexCount += 4;
                    }
                    // py (Top, Y+)
                    if (this.isTransparent(worldX, worldY + 1, worldZ)) {
                        this.addFace(positions, normals, uvs, indices, vertexCount, [0, 1, 0],
                            [worldX, worldY + 1, worldZ + 1], [worldX + 1, worldY + 1, worldZ + 1], [worldX + 1, worldY + 1, worldZ], [worldX, worldY + 1, worldZ],
                            texTop, rotation, true
                        );
                        vertexCount += 4;
                    }
                    // ny (Bottom, Y-)
                    if (this.isTransparent(worldX, worldY - 1, worldZ)) {
                        this.addFace(positions, normals, uvs, indices, vertexCount, [0, -1, 0], 
                            [worldX, worldY, worldZ], [worldX + 1, worldY, worldZ], [worldX + 1, worldY, worldZ + 1], [worldX, worldY, worldZ + 1], 
                            texBottom, rotation, true
                        );
                        vertexCount += 4;
                    }
                    // pz (Front, Z+)
                    if (this.isTransparent(worldX, worldY, worldZ + 1)) {
                        this.addFace(positions, normals, uvs, indices, vertexCount, [0, 0, 1],
                            [worldX, worldY, worldZ + 1], [worldX + 1, worldY, worldZ + 1], [worldX + 1, worldY + 1, worldZ + 1], [worldX, worldY + 1, worldZ + 1],
                            physPZ, rotation, false
                        );
                        vertexCount += 4;
                    }
                    // nz (Back, Z-)
                    if (this.isTransparent(worldX, worldY, worldZ - 1)) {
                        this.addFace(positions, normals, uvs, indices, vertexCount, [0, 0, -1], 
                            [worldX + 1, worldY, worldZ], [worldX, worldY, worldZ], [worldX, worldY + 1, worldZ], [worldX + 1, worldY + 1, worldZ], 
                            physNZ, rotation, false
                        );
                        vertexCount += 4;
                    }
                }
            }
        }

        let mesh = this.meshes.get(chunkId);
        
        if (positions.length === 0) {
            if (mesh) {
                this.group.remove(mesh);
                mesh.geometry.dispose();
                this.meshes.delete(chunkId);
            }
            return;
        }

        if (!mesh) {
            const geometry = new THREE.BufferGeometry();
            mesh = new THREE.Mesh(geometry, textureAtlas.getMaterial());
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.name = chunkId;
            this.meshes.set(chunkId, mesh);
            this.group.add(mesh);
        }

        const geometry = mesh.geometry;
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeBoundingSphere();
    }

    private isTransparent(x: number, y: number, z: number): boolean {
        if (this.layerLimitEnabled && y > this.layerLimit) return true;
        const id = this.getBlock(x, y, z);
        return id === 0 || (BLOCKS[id] && !!BLOCKS[id].transparent);
    }

    private addFace(
        positions: number[], 
        normals: number[], 
        uvs: number[], 
        indices: number[], 
        offset: number, 
        normal: number[], 
        v1: number[], v2: number[], v3: number[], v4: number[],
        textureName: string,
        rotation: number,
        isCap: boolean // Top or Bottom face
    ) {
        positions.push(...v1, ...v2, ...v3, ...v4);
        normals.push(...normal, ...normal, ...normal, ...normal);
        
        let uv = textureAtlas.getUV(textureName);
        if (!uv) uv = textureAtlas.getUV('MISSING');

        if (uv) {
            // Inset UVs to prevent texture bleeding at tile edges
            // Using half-pixel inset based on tile size (16px in 2048px atlas)
            const eps = 0.5 / 2048; // Half pixel in atlas space
            const uMin = uv.u + eps;
            const uMax = uv.u + uv.uSize - eps;
            const vMin = uv.v + eps;
            const vMax = uv.v + uv.vSize - eps;

            // Standard UVs: (0,0), (1,0), (1,1), (0,1)
            let coords = [
                uMin, vMin,
                uMax, vMin,
                uMax, vMax,
                uMin, vMax
            ];

            // If it's a top/bottom face, we might want to rotate the UVs so the texture aligns with the block rotation
            if (isCap) {
                // Shift UVs based on rotation
                // Rot 0: No change
                // Rot 1: 90 deg
                for(let r=0; r<rotation; r++) {
                    // Shift: 0->1, 1->2, 2->3, 3->0
                    // Current pairs: [0,1], [2,3], [4,5], [6,7]
                    const p0x = coords[0], p0y = coords[1];
                    coords[0] = coords[2]; coords[1] = coords[3];
                    coords[2] = coords[4]; coords[3] = coords[5];
                    coords[4] = coords[6]; coords[5] = coords[7];
                    coords[6] = p0x;       coords[7] = p0y;
                }
            }

            uvs.push(...coords);
        } else {
            // Should catch earlier with MISSING, but safe fallback
            uvs.push(0,0, 1,0, 1,1, 0,1);
        }

        indices.push(
            offset, offset + 1, offset + 2,
            offset + 2, offset + 3, offset
        );
    }
}
