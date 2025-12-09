
import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { X, Upload, Check, Globe, Layers, ArrowRight } from 'lucide-react';
import { getNextBlockId, registerCustomBlock, CustomBlockData } from '../blocks';
import { textureAtlas } from '../TextureAtlas';
import { Storage } from '../utils/Storage';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
    isDay: boolean;
}

interface FoundTexture {
    name: string;
    path: string;
    data: string; // Base64
}

interface ConfigItem {
    id: string;
    blockName: string;
    category: string;
    selected: boolean;
    // We now track faces separately
    textures: {
        top: FoundTexture;
        side: FoundTexture;
        bottom: FoundTexture;
    };
    isGrouped: boolean; // visual flag if it combined multiple files
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportComplete, isDay }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [configList, setConfigList] = useState<ConfigItem[]>([]);
    const [loading, setLoading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    // --- HEURISTIC GROUPING LOGIC ---
    const groupTextures = (textures: FoundTexture[]): ConfigItem[] => {
        const groups: Record<string, { top?: FoundTexture, side?: FoundTexture, bottom?: FoundTexture, front?: FoundTexture }> = {};
        
        // Suffixes to strip to find the "base name"
        // Order matters: specific before general (longest first)
        const suffixes = [
            // Directions & Orientations (Longest first)
            { s: '_front_horizontal', type: 'front' },
            { s: '_front_vertical', type: 'front' },
            { s: '_top_sticky', type: 'top' },
            
            // Redstone / States
            { s: '_top_on', type: 'top' },
            { s: '_top_off', type: 'top' },
            { s: '_on', type: 'front' },
            { s: '_off', type: 'front' },
            { s: '_1tick', type: 'top' },
            { s: '_2tick', type: 'top' },
            { s: '_3tick', type: 'top' },
            { s: '_4tick', type: 'top' },
            
            // Standard Faces
            { s: '_bottom', type: 'bottom' },
            { s: '_front', type: 'front' }, 
            { s: '_side', type: 'side' },
            { s: '_top', type: 'top' },
            { s: '_end', type: 'top' },    // logs
            
            // Misc
            { s: '_open', type: 'front' }, // barrel
            { s: '_moist', type: 'top' },  // farmland
            { s: '_snow', type: 'side' },  // grass_block_snow
            { s: '_base', type: 'side' }, 
            
            // Cardinal Directions
            { s: '_north', type: 'side' },
            { s: '_south', type: 'side' },
            { s: '_east', type: 'side' },
            { s: '_west', type: 'side' },
            { s: '_up', type: 'top' },
            { s: '_down', type: 'bottom' },

            // Stages (Crops)
            { s: '_stage0', type: 'side' },
            { s: '_stage1', type: 'side' },
            { s: '_stage2', type: 'side' },
            { s: '_stage3', type: 'side' },
            { s: '_stage4', type: 'side' },
            { s: '_stage5', type: 'side' },
            { s: '_stage6', type: 'side' },
            { s: '_stage7', type: 'side' },
        ];

        textures.forEach(tex => {
            let baseName = tex.name;
            let type: 'top' | 'side' | 'bottom' | 'front' | 'all' = 'all';

            // Check suffixes
            for (const { s, type: t } of suffixes) {
                if (baseName.endsWith(s)) {
                    baseName = baseName.substring(0, baseName.length - s.length);
                    type = t as any;
                    break;
                }
            }
            
            // Clean up trailing underscores and numbers (often used for variants like _0, _1 or extra _)
            baseName = baseName.replace(/_\d+$/, '').replace(/_+$/, '');

            if (!groups[baseName]) {
                groups[baseName] = {};
            }
            
            const g = groups[baseName];

            if (type === 'all') {
                // If it's a generic name (e.g. "stone"), use for all unless overridden
                if (!g.side) g.side = tex;
                if (!g.top) g.top = tex;
                if (!g.bottom) g.bottom = tex;
            } else if (type === 'top') {
                g.top = tex;
                // If using _end, it implies bottom too usually
                if (tex.name.endsWith('_end') && !g.bottom) g.bottom = tex;
            } else if (type === 'bottom') {
                g.bottom = tex;
            } else if (type === 'side') {
                g.side = tex;
            } else if (type === 'front') {
                g.front = tex;
            }
        });

        // Convert groups to ConfigItems
        return Object.entries(groups).map(([baseName, g], idx) => {
            // Must have at least one texture
            const mainTex = g.front || g.side || g.top || g.bottom;
            if (!mainTex) return null;

            // Resolve Faces
            // Priority: Front overrides Side (e.g. Furnace Front is the "Side" face in our engine limitation)
            const side = g.front || g.side || mainTex;
            const top = g.top || side; // If top missing, use side
            const bottom = g.bottom || top; // If bottom missing, use top

            // Detect if this is a grouped block (has different textures)
            const isGrouped = !!((g.side || g.front) && g.top && (g.side?.name !== g.top?.name));

            return {
                id: `blk-${idx}`,
                blockName: baseName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                category: 'Imported',
                selected: true, // Auto-select by default
                textures: { top, side, bottom },
                isGrouped
            };
        }).filter(Boolean) as ConfigItem[];
    };

    const processZip = async (file: File | Blob) => {
        setLoading(true);
        try {
            const zip = await JSZip.loadAsync(file);
            const textures: FoundTexture[] = [];
            
            // Allow any PNG file in the archive
            const regex = /\.png$/i;

            const entries: Array<{path: string, obj: JSZip.JSZipObject}> = [];
            
            zip.forEach((relativePath, zipEntry) => {
                if (!zipEntry.dir && regex.test(relativePath)) {
                    entries.push({ path: relativePath, obj: zipEntry });
                }
            });

            for (const { path, obj } of entries) {
                try {
                    const base64 = await obj.async('base64');
                    // Use just filename for identification, ignore folders
                    const name = path.split('/').pop()?.replace('.png', '') || 'unknown';
                    textures.push({
                        name,
                        path,
                        data: `data:image/png;base64,${base64}`
                    });
                } catch (e) {
                    console.warn(`Failed to read ${path}`, e);
                }
            }

            if (textures.length === 0) {
                alert('No PNG files found in the archive.');
                setLoading(false);
                return;
            }

            const items = groupTextures(textures);
            setConfigList(items);
            setStep(2);

        } catch (err) {
            console.error(err);
            alert('Failed to process file.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processZip(file);
    };

    const handleImport = async () => {
        const selectedItems = configList.filter(i => i.selected);
        if (selectedItems.length === 0) return;

        setLoading(true);
        
        let startId = getNextBlockId();
        const savedBlocks: CustomBlockData[] = [];

        // Process sequentially to avoid race conditions in Atlas
        for (const item of selectedItems) {
            const id = startId++;
            
            // Helper to load texture and return Atlas Key
            // We use a simplified key to avoid massive strings, but ensure uniqueness
            // sanitize name for key
            const safeName = item.blockName.replace(/[^a-zA-Z0-9]/g, '');
            
            const processTex = async (tex: FoundTexture, suffix: string): Promise<string> => {
                 const atlasKey = `cust_${safeName}_${suffix}_${Date.now()}_${Math.floor(Math.random()*1000)}`; 
                 await textureAtlas.addTextureFromData(atlasKey, tex.data);
                 return atlasKey;
            };

            // We must store the raw data to persist correctly
            const textureDataMap: Record<string, string> = {};

            // Top
            const topKey = await processTex(item.textures.top, 'top');
            textureDataMap[topKey] = item.textures.top.data;

            // Side
            const sideKey = await processTex(item.textures.side, 'side');
            textureDataMap[sideKey] = item.textures.side.data;

            // Bottom
            const botKey = await processTex(item.textures.bottom, 'bot');
            textureDataMap[botKey] = item.textures.bottom.data;

            const def: CustomBlockData = {
                id,
                name: item.blockName,
                group: 'Custom',
                category: item.category,
                textures: {
                    top: topKey,
                    side: sideKey,
                    bottom: botKey
                },
                textureData: textureDataMap
            };
            
            registerCustomBlock(def);
            savedBlocks.push(def);
        }

        // Persist via IndexedDB
        try {
            await Storage.saveCustomBlocks(savedBlocks);
        } catch (e) {
            console.error("Storage failed", e);
            alert("Failed to save custom blocks to storage.");
        }

        setLoading(false);
        onImportComplete();
        onClose();
        
        setStep(1);
        setConfigList([]);
    };

    const toggleSelect = (id: string) => {
        setConfigList(prev => prev.map(item => 
            item.id === id ? { ...item, selected: !item.selected } : item
        ));
    };

    const updateItem = (id: string, updates: Partial<ConfigItem>) => {
        setConfigList(prev => prev.map(item => 
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const selectAll = () => {
        const allSelected = configList.every(i => i.selected);
        setConfigList(prev => prev.map(i => ({ ...i, selected: !allSelected })));
    };

    const bgClass = isDay ? "bg-white text-gray-800" : "bg-slate-900 text-slate-100";
    const borderClass = isDay ? "border-gray-200" : "border-slate-700";
    const inputClass = isDay 
        ? "bg-gray-50 border-gray-300 text-gray-900" 
        : "bg-slate-800 border-slate-600 text-white placeholder-slate-400";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-4xl h-[85vh] flex flex-col rounded-xl shadow-2xl ${bgClass}`}>
                
                {/* Header */}
                <div className={`p-4 border-b flex justify-between items-center ${borderClass}`}>
                    <h2 className="text-xl font-bold">Import Custom Textures</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-black/10">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 ? (
                        <div className="space-y-8">
                            <div className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors ${isDay ? "border-gray-300 hover:border-blue-400 bg-gray-50" : "border-slate-700 hover:border-blue-500 bg-slate-800/50"}`}>
                                <Upload size={48} className="mb-4 opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">Upload Resource Pack (ZIP)</h3>
                                <p className="text-sm opacity-70 mb-6 max-w-md">
                                    We automatically detect and group textures like <code>block_top.png</code>, <code>block_side.png</code> into single blocks.
                                </p>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    accept=".zip,.jar"
                                    onChange={handleFileUpload}
                                    className="hidden" 
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    Select Archive
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <div className="text-sm opacity-70">
                                    Found {configList.length} unique blocks.
                                </div>
                                <button onClick={selectAll} className="text-sm text-blue-500 hover:underline">
                                    Select/Deselect All
                                </button>
                            </div>

                            <div className="grid gap-2">
                                {configList.map(item => (
                                    <div 
                                        key={item.id} 
                                        className={`flex items-start gap-4 p-3 rounded-lg border ${
                                            item.selected 
                                            ? (isDay ? 'bg-blue-50 border-blue-200' : 'bg-blue-900/20 border-blue-800')
                                            : (isDay ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700')
                                        }`}
                                    >
                                        <button 
                                            onClick={() => toggleSelect(item.id)}
                                            className={`mt-2 w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                                                item.selected
                                                ? 'bg-blue-500 border-blue-500 text-white'
                                                : 'border-gray-400 hover:border-blue-400'
                                            }`}
                                        >
                                            {item.selected && <Check size={14} />}
                                        </button>

                                        {/* Texture Preview */}
                                        <div className="flex flex-col gap-1 w-20 flex-shrink-0">
                                            <div className="w-full aspect-square bg-gray-500/10 rounded p-1 relative border border-white/10" title="Side/Front">
                                                <img src={item.textures.side.data} alt="Side" className="w-full h-full object-contain pixelated" />
                                                <span className="absolute bottom-0 right-0 text-[8px] bg-black/60 text-white px-1 rounded-tl">Side</span>
                                            </div>
                                            {(item.isGrouped) && (
                                                <div className="flex gap-1">
                                                    <div className="flex-1 aspect-square bg-gray-500/10 rounded p-0.5 relative" title="Top">
                                                        <img src={item.textures.top.data} className="w-full h-full object-contain pixelated" />
                                                    </div>
                                                    <div className="flex-1 aspect-square bg-gray-500/10 rounded p-0.5 relative" title="Bottom">
                                                        <img src={item.textures.bottom.data} className="w-full h-full object-contain pixelated" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                                            <div className="space-y-1">
                                                <label className="text-xs opacity-50 uppercase font-semibold">Block Name</label>
                                                <input 
                                                    type="text" 
                                                    value={item.blockName}
                                                    onChange={(e) => updateItem(item.id, { blockName: e.target.value })}
                                                    className={`w-full px-3 py-1.5 rounded text-sm border focus:border-blue-500 outline-none ${inputClass}`}
                                                    disabled={!item.selected}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs opacity-50 uppercase font-semibold">Category</label>
                                                <select
                                                    value={item.category}
                                                    onChange={(e) => updateItem(item.id, { category: e.target.value })}
                                                    className={`w-full px-3 py-1.5 rounded text-sm border focus:border-blue-500 outline-none ${inputClass}`}
                                                    disabled={!item.selected}
                                                >
                                                    <option value="Imported">Imported</option>
                                                    <option value="Building">Building</option>
                                                    <option value="Nature">Nature</option>
                                                    <option value="Decoration">Decoration</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2 text-xs opacity-50 truncate">
                                                Sources: {item.textures.side.name}
                                                {item.isGrouped && `, ${item.textures.top.name}...`}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`p-4 border-t flex justify-end gap-3 ${borderClass}`}>
                    {loading && <span className="flex items-center px-4 text-sm opacity-70">Processing...</span>}
                    {step === 2 && (
                         <button 
                            onClick={() => { setStep(1); setConfigList([]); }}
                            className={`px-4 py-2 rounded-lg font-medium ${isDay ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                        >
                            Back
                        </button>
                    )}
                    <button 
                        onClick={step === 1 ? () => {} : handleImport}
                        disabled={loading || (step === 2 && configList.filter(i => i.selected).length === 0)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        {step === 1 ? 'Waiting...' : `Import ${configList.filter(i => i.selected).length} Blocks`}
                    </button>
                </div>
            </div>
        </div>
    );
};
