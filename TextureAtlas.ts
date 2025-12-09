
import * as THREE from 'three';
import { BLOCKS, BlockDef } from './blocks';

export interface TextureUV {
    u: number;
    v: number;
    uSize: number;
    vSize: number;
    size: number;
}

export class TextureAtlas {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public texture: THREE.CanvasTexture;
    public material: THREE.MeshLambertMaterial;
    
    private textures: Map<string, TextureUV> = new Map();
    private nextX: number = 0;
    private nextY: number = 0;
    private readonly atlasSize = 2048;
    private readonly tileSize = 16;
    private readonly tilePadding = 2; // Padding between tiles to prevent bleeding
    private readonly baseUrl = 'https://raw.githubusercontent.com/Faithful-Pack/Default-Java/1.21.5/assets/minecraft/textures/';
    private readonly entityUrl = 'https://raw.githubusercontent.com/Faithful-Pack/Default-Java/1.21.5/assets/minecraft/textures/entity/';
    private loadedTextureNames: Set<string> = new Set();
    
    public isLoading: boolean = false;
    private listeners: (() => void)[] = [];
    private stateListeners: ((loading: boolean) => void)[] = [];

    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.atlasSize;
        this.canvas.height = this.atlasSize;

        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
        // Disable image smoothing to prevent texture feathering/bleeding
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, this.atlasSize, this.atlasSize);

        // Debug Pattern at 0,0 (with padding considered)
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.fillRect(0, 0, 8, 8);
        this.ctx.fillRect(8, 8, 8, 8);
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(8, 0, 8, 8);
        this.ctx.fillRect(0, 8, 8, 8);

        // Account for padding in tile size calculation
        const effectiveTileSize = this.tileSize + this.tilePadding;
        const size = this.tileSize / this.atlasSize;
        this.textures.set('MISSING', {
            u: 0,
            v: 1 - size,
            uSize: size,
            vSize: size,
            size
        });

        this.nextX = effectiveTileSize;

        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.magFilter = THREE.NearestFilter;
        this.texture.minFilter = THREE.NearestFilter;
        this.texture.colorSpace = THREE.SRGBColorSpace;
        this.texture.generateMipmaps = false; 

        this.material = new THREE.MeshLambertMaterial({
            map: this.texture,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide
        });
    }

    public onLoad(callback: () => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
    
    public onLoadStateChange(callback: (loading: boolean) => void) {
        this.stateListeners.push(callback);
        return () => {
            this.stateListeners = this.stateListeners.filter(l => l !== callback);
        };
    }

    private setLoading(loading: boolean) {
        if (this.isLoading !== loading) {
            this.isLoading = loading;
            this.stateListeners.forEach(cb => cb(loading));
        }
    }

    private notifyListeners() {
        this.listeners.forEach(cb => cb());
    }

    private loadTexture(url: string, id: string): Promise<TextureUV> {
        return new Promise((resolve) => {
            if (this.textures.has(id)) {
                resolve(this.textures.get(id)!);
                return;
            }

            this.loadedTextureNames.add(id);

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;
            
            img.onload = () => {
                this.drawToCanvas(img, id);
                resolve(this.textures.get(id)!);
            };

            img.onerror = () => {
                // console.warn(`Failed to load texture: ${url}`);
                resolve(this.getUV('MISSING')!); 
            };
        });
    }

    public async loadEntitySkin(name: string, path: string): Promise<void> {
        return new Promise((resolve) => {
            // Check if already loaded (check one face)
            if (this.textures.has(`${name}_head_front`)) {
                resolve();
                return;
            }
            this.loadedTextureNames.add(name);

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = `${this.entityUrl}${path}.png`;

            img.onload = () => {
                this.cropAndDraw(img, 8, 8, 8, 8, `${name}_head_front`);
                this.cropAndDraw(img, 0, 8, 8, 8, `${name}_head_right`);
                this.cropAndDraw(img, 16, 8, 8, 8, `${name}_head_left`);
                this.cropAndDraw(img, 24, 8, 8, 8, `${name}_head_back`);
                this.cropAndDraw(img, 8, 0, 8, 8, `${name}_head_top`);
                this.cropAndDraw(img, 16, 0, 8, 8, `${name}_head_bottom`);
                
                resolve();
            };

            img.onerror = () => {
                console.warn(`Failed to load entity skin: ${path}`);
                resolve();
            }
        });
    }

    private cropAndDraw(source: HTMLImageElement, sx: number, sy: number, sw: number, sh: number, id: string) {
        // Create a temp canvas to crop
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.tileSize;
        tempCanvas.height = this.tileSize;
        const tCtx = tempCanvas.getContext('2d')!;

        // Draw scaled up to 16x16
        tCtx.imageSmoothingEnabled = false;
        tCtx.drawImage(source, sx, sy, sw, sh, 0, 0, this.tileSize, this.tileSize);

        // Now draw this temp canvas to the atlas
        const img = new Image();
        img.src = tempCanvas.toDataURL();
        img.onload = () => {
            this.drawToCanvas(img, id);
            // Clean up temp canvas to prevent memory leak
            tempCanvas.width = 0;
            tempCanvas.height = 0;
        };
        img.onerror = () => {
            console.warn(`Failed to process cropped texture: ${id}`);
            // Clean up even on error
            tempCanvas.width = 0;
            tempCanvas.height = 0;
        };
    }

    private drawToCanvas(img: HTMLImageElement, id: string) {
        if (img.width === 0 || img.height === 0) return;

        const effectiveTileSize = this.tileSize + this.tilePadding;

        if (this.nextX + effectiveTileSize > this.atlasSize) {
            this.nextX = 0;
            this.nextY += effectiveTileSize;
        }

        if (this.nextY + effectiveTileSize > this.atlasSize) {
            console.error('Texture Atlas full!');
            return;
        }

        const x = this.nextX;
        const y = this.nextY;

        // Ensure image smoothing stays disabled
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(img, 0, 0, img.width, img.height, x, y, this.tileSize, this.tileSize);

        const u = x / this.atlasSize;
        const v = 1 - ((y + this.tileSize) / this.atlasSize);
        const size = this.tileSize / this.atlasSize;

        const uv: TextureUV = {
            u,
            v,
            uSize: size,
            vSize: size,
            size
        };
        this.textures.set(id, uv);

        // Advance position with padding
        this.nextX += effectiveTileSize;

        this.texture.needsUpdate = true;
        this.material.map = this.texture; // Re-assign to ensure update
        this.material.needsUpdate = true;
    }

    public async addTextureFromData(id: string, dataUrl: string): Promise<TextureUV> {
        if (this.textures.has(id)) return this.textures.get(id)!;
        
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.drawToCanvas(img, id);
                this.notifyListeners(); // Notify updates
                resolve(this.textures.get(id)!);
            };
            img.onerror = () => resolve(this.getUV('MISSING')!);
            img.src = dataUrl;
        });
    }

    public async loadBlockTexture(name: string) {
        const result = await this.loadTexture(`${this.baseUrl}block/${name}.png`, name);
        this.notifyListeners();
        return result;
    }

    public getUV(name: string): TextureUV | undefined {
        return this.textures.get(name) || this.textures.get('MISSING');
    }

    public getAtlasCoordinates(uv: TextureUV) {
        const x = uv.u * this.atlasSize;
        const y = (1 - uv.v) * this.atlasSize - this.tileSize;
        return { x, y, width: this.tileSize, height: this.tileSize };
    }

    public getMaterial(): THREE.MeshLambertMaterial {
        return this.material;
    }

    // --- LAZY LOADING ---

    public async preloadUsedBlocks(usedBlockIds: number[]) {
        const uniqueTextures = new Set<string>();
        const entitiesToLoad = new Set<BlockDef>();

        usedBlockIds.forEach(id => {
            const block = BLOCKS[id];
            if (!block) return;
            
            if (block.group === 'Entities') {
                entitiesToLoad.add(block);
            } else {
                uniqueTextures.add(block.textures.top);
                uniqueTextures.add(block.textures.side);
                uniqueTextures.add(block.textures.bottom);
                if (block.textures.front) uniqueTextures.add(block.textures.front);
            }
        });

        // Always load basic blocks
        ['grass_block_top', 'grass_block_side', 'dirt', 'stone', 'oak_planks'].forEach(t => uniqueTextures.add(t));

        await this.processLoadQueue(uniqueTextures);
        await this.processEntityQueue(entitiesToLoad);
    }

    public async loadTexturesForCategory(category: string, allBlocks: BlockDef[]) {
        const uniqueTextures = new Set<string>();
        const entitiesToLoad = new Set<BlockDef>();
        
        allBlocks.filter(b => b.category === category || b.group === category).forEach(block => {
            if (block.group === 'Entities') {
                entitiesToLoad.add(block);
            } else {
                uniqueTextures.add(block.textures.top);
                uniqueTextures.add(block.textures.side);
                uniqueTextures.add(block.textures.bottom);
                if (block.textures.front) uniqueTextures.add(block.textures.front);
                if (block.textures.back) uniqueTextures.add(block.textures.back);
            }
        });

        if (uniqueTextures.size > 0) await this.processLoadQueue(uniqueTextures);
        if (entitiesToLoad.size > 0) await this.processEntityQueue(entitiesToLoad);
    }

    private async processLoadQueue(textures: Set<string>) {
        const toLoad = Array.from(textures).filter(t => !this.textures.has(t) && !this.loadedTextureNames.has(t));
        if (toLoad.length === 0) return;

        this.setLoading(true);
        toLoad.forEach(t => this.loadedTextureNames.add(t));

        const BATCH_SIZE = 10;
        let batchCount = 0;
        for (let i = 0; i < toLoad.length; i += BATCH_SIZE) {
            const batch = toLoad.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(tex => this.loadTexture(`${this.baseUrl}block/${tex}.png`, tex)));
            batchCount++;
            if (batchCount % 2 === 0) this.notifyListeners();
        }
        this.notifyListeners();
        this.setLoading(false);
    }

    private async processEntityQueue(blocks: Set<BlockDef>) {
        const toLoad = Array.from(blocks).filter(b => !this.loadedTextureNames.has(b.name));
        if (toLoad.length === 0) return;

        this.setLoading(true);
        for (const block of toLoad) {
             // Path stored in side texture property for convenience
             const path = block.textures.side; 
             await this.loadEntitySkin(block.name, path);
        }
        this.notifyListeners();
        this.setLoading(false);
    }

    // Legacy
    public async preloadDefinedBlocks() {
        await this.preloadUsedBlocks([1, 2, 3, 10, 30]);
    }
}

export const textureAtlas = new TextureAtlas();
