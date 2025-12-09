
import fileSaver from 'file-saver';
import JSZip from 'jszip';
import { VoxelWorld } from '../VoxelWorld';
import { BLOCKS } from '../blocks';
import { textureAtlas } from '../TextureAtlas';

// Handle flexible import for file-saver in different environments
// The module might export the function as default, or as a named property depending on the bundle
const saveAs = (fileSaver as any).saveAs || fileSaver;

export interface ProjectData {
    name: string;
    version: number;
    created: string;
    blocks: {x: number, y: number, z: number, id: number}[];
}

export const ProjectManager = {
    saveProject: (world: VoxelWorld, name: string = 'Untitled') => {
        const blocks = world.getAllBlocks();
        const data: ProjectData = {
            name,
            version: 1,
            created: new Date().toISOString(),
            blocks
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        saveAs(blob, `${name.toLowerCase().replace(/\s+/g, '_')}.json`);
    },

    loadProject: async (file: File, world: VoxelWorld) => {
        return new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = e.target?.result as string;
                    const data: ProjectData = JSON.parse(json);
                    
                    if (data.blocks && Array.isArray(data.blocks)) {
                        world.clear();
                        // Batch placing could be optimized, but using placeBlock ensures geometry updates
                        // We can optimize by disabling updates during load if needed, but for now simple loop is fine.
                        data.blocks.forEach(b => {
                            world.placeBlock(b.x, b.y, b.z, b.id);
                        });
                        resolve();
                    } else {
                        reject(new Error('Invalid project file format'));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsText(file);
        });
    },

    exportMaterialsCSV: (counts: Map<number, number>) => {
        let csv = 'Block Name,Count,Stacks\n';
        counts.forEach((count, id) => {
            const block = BLOCKS[id];
            if (block) {
                const stacks = (count / 64).toFixed(2);
                csv += `"${block.name}",${count},${stacks}\n`;
            }
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'materials.csv');
    },

    exportLayerImages: async (world: VoxelWorld) => {
        const zip = new JSZip();
        const blocks = world.getAllBlocks();
        
        if (blocks.length === 0) {
            alert("No blocks to export!");
            return;
        }

        // 1. Calculate Bounds
        let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
        blocks.forEach(b => {
            minX = Math.min(minX, b.x); maxX = Math.max(maxX, b.x);
            minZ = Math.min(minZ, b.z); maxZ = Math.max(maxZ, b.z);
        });

        // Add padding
        minX -= 1; maxX += 1; minZ -= 1; maxZ += 1;

        const TILE_SIZE = 32;
        const width = (maxX - minX + 1) * TILE_SIZE;
        const height = (maxZ - minZ + 1) * TILE_SIZE;

        // 2. Group by Layer
        const layers = new Map<number, typeof blocks>();
        blocks.forEach(b => {
            if (!layers.has(b.y)) layers.set(b.y, []);
            layers.get(b.y)!.push(b);
        });

        // 3. Render Each Layer
        const sortedLayers = Array.from(layers.keys()).sort((a, b) => a - b);
        
        for (const y of sortedLayers) {
            const layerBlocks = layers.get(y)!;
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;

            // Background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);

            // Grid
            ctx.strokeStyle = '#e5e7eb'; // Gray-200
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let gx = 0; gx <= width; gx += TILE_SIZE) {
                ctx.moveTo(gx, 0); ctx.lineTo(gx, height);
            }
            for (let gz = 0; gz <= height; gz += TILE_SIZE) {
                ctx.moveTo(0, gz); ctx.lineTo(width, gz);
            }
            ctx.stroke();

            // Draw Blocks
            layerBlocks.forEach(b => {
                const blockDef = BLOCKS[b.id];
                if (!blockDef) return;

                const dx = (b.x - minX) * TILE_SIZE;
                const dy = (b.z - minZ) * TILE_SIZE; // Map Z to Y for top-down view

                const uv = textureAtlas.getUV(blockDef.textures.top);
                if (uv) {
                    const coords = textureAtlas.getAtlasCoordinates(uv);
                    ctx.drawImage(
                        textureAtlas.canvas,
                        coords.x, coords.y, coords.width, coords.height,
                        dx, dy, TILE_SIZE, TILE_SIZE
                    );
                } else {
                    ctx.fillStyle = '#cccccc';
                    ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
                }
            });

            // Add Coordinates Text
            ctx.fillStyle = '#000000';
            ctx.font = '12px sans-serif';
            ctx.fillText(`Layer ${y}`, 5, 15);

            // Save to ZIP
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (blob) {
                zip.file(`layer_${y}.png`, blob);
            }
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "project_layers.zip");
    }
};
