
import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { X, Upload, Check, Globe, Layers, ArrowRight, Link } from 'lucide-react';
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
    const [githubUrl, setGithubUrl] = useState('');
    const [githubError, setGithubError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    // --- HEURISTIC GROUPING LOGIC ---
    const groupTextures = (textures: FoundTexture[]): ConfigItem[] => {
        const groups: Record<string, { top?: FoundTexture, side?: FoundTexture, bottom?: FoundTexture, front?: FoundTexture; modId?: string }> = {};

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
            let rawName = tex.name;
            let modId: string | undefined;

            // Handle namespaced textures (modid:texturename)
            if (rawName.includes(':')) {
                const parts = rawName.split(':');
                modId = parts[0];
                rawName = parts[1];
            }

            let baseName = rawName;
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

            // Include modId in group key to prevent collisions between mods
            const groupKey = modId ? `${modId}:${baseName}` : baseName;

            if (!groups[groupKey]) {
                groups[groupKey] = { modId };
            }

            const g = groups[groupKey];

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
        return Object.entries(groups).map(([groupKey, g], idx) => {
            // Must have at least one texture
            const mainTex = g.front || g.side || g.top || g.bottom;
            if (!mainTex) return null;

            // Extract display name from group key
            let displayName = groupKey;
            if (groupKey.includes(':')) {
                // For mod textures, format as "ModName - BlockName"
                const [modPart, blockPart] = groupKey.split(':');
                const modName = modPart.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                const blockName = blockPart.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                displayName = `${modName}: ${blockName}`;
            } else {
                displayName = groupKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            }

            // Resolve Faces
            // Priority: Front overrides Side (e.g. Furnace Front is the "Side" face in our engine limitation)
            const side = g.front || g.side || mainTex;
            const top = g.top || side; // If top missing, use side
            const bottom = g.bottom || top; // If bottom missing, use top

            // Detect if this is a grouped block (has different textures)
            const isGrouped = !!((g.side || g.front) && g.top && (g.side?.name !== g.top?.name));

            // Determine category based on mod
            const category = g.modId ? `Mod: ${g.modId}` : 'Imported';

            return {
                id: `blk-${idx}`,
                blockName: displayName,
                category,
                selected: true, // Auto-select by default
                textures: { top, side, bottom },
                isGrouped
            };
        }).filter(Boolean) as ConfigItem[];
    };

    // Detect if path is a mod/resource pack texture path and extract clean name
    const parseTexturePath = (fullPath: string): { name: string; type: 'block' | 'item' | 'entity' | 'other'; modId?: string } => {
        // Common patterns:
        // assets/<modid>/textures/block/<name>.png - Mod block textures
        // assets/<modid>/textures/item/<name>.png - Mod item textures
        // assets/<modid>/textures/entity/<name>.png - Mod entity textures
        // assets/minecraft/textures/block/<name>.png - Vanilla resource pack
        // textures/block/<name>.png - Simple resource pack
        // block/<name>.png - Very simple structure
        // <name>.png - Flat structure

        const blockMatch = fullPath.match(/assets\/([^/]+)\/textures\/block\/(.+)\.png$/i);
        if (blockMatch) {
            return {
                name: blockMatch[2].split('/').pop() || blockMatch[2],
                type: 'block',
                modId: blockMatch[1] !== 'minecraft' ? blockMatch[1] : undefined
            };
        }

        const itemMatch = fullPath.match(/assets\/([^/]+)\/textures\/item\/(.+)\.png$/i);
        if (itemMatch) {
            return {
                name: itemMatch[2].split('/').pop() || itemMatch[2],
                type: 'item',
                modId: itemMatch[1] !== 'minecraft' ? itemMatch[1] : undefined
            };
        }

        const entityMatch = fullPath.match(/assets\/([^/]+)\/textures\/entity\/(.+)\.png$/i);
        if (entityMatch) {
            return {
                name: entityMatch[2].split('/').pop() || entityMatch[2],
                type: 'entity',
                modId: entityMatch[1] !== 'minecraft' ? entityMatch[1] : undefined
            };
        }

        // Simpler patterns
        const simpleBlockMatch = fullPath.match(/textures\/block\/(.+)\.png$/i);
        if (simpleBlockMatch) {
            return { name: simpleBlockMatch[1].split('/').pop() || simpleBlockMatch[1], type: 'block' };
        }

        const verySimpleMatch = fullPath.match(/block\/(.+)\.png$/i);
        if (verySimpleMatch) {
            return { name: verySimpleMatch[1].split('/').pop() || verySimpleMatch[1], type: 'block' };
        }

        // Fallback: just use filename
        const filename = fullPath.split('/').pop()?.replace('.png', '') || 'unknown';
        return { name: filename, type: 'other' };
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

            // Detect mod structure: prioritize block textures
            const blockTextures: typeof entries = [];
            const otherTextures: typeof entries = [];

            for (const entry of entries) {
                const parsed = parseTexturePath(entry.path);
                if (parsed.type === 'block') {
                    blockTextures.push(entry);
                } else if (parsed.type !== 'entity') { // Skip entity textures for block import
                    otherTextures.push(entry);
                }
            }

            // Prefer block textures if found, otherwise use all
            const texturesToProcess = blockTextures.length > 0 ? blockTextures : otherTextures;

            for (const { path, obj } of texturesToProcess) {
                try {
                    const base64 = await obj.async('base64');
                    const parsed = parseTexturePath(path);

                    // Build name with optional mod prefix for disambiguation
                    let texName = parsed.name;
                    if (parsed.modId && blockTextures.length > 0) {
                        // Add mod prefix only if we found mod structure
                        texName = `${parsed.modId}:${parsed.name}`;
                    }

                    textures.push({
                        name: texName,
                        path,
                        data: `data:image/png;base64,${base64}`
                    });
                } catch (e) {
                    console.warn(`Failed to read ${path}`, e);
                }
            }

            if (textures.length === 0) {
                alert('No block textures found in the archive. Make sure your mod/resource pack has textures in assets/<modid>/textures/block/');
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

    // Parse GitHub repo URL to extract owner/repo/path
    const parseGitHubUrl = (url: string): { owner: string; repo: string; branch: string; path: string } | null => {
        try {
            // Support various GitHub URL formats:
            // https://github.com/owner/repo
            // https://github.com/owner/repo/tree/branch
            // https://github.com/owner/repo/tree/branch/path/to/textures
            const urlObj = new URL(url);
            if (!urlObj.hostname.includes('github.com')) return null;

            const parts = urlObj.pathname.split('/').filter(Boolean);
            if (parts.length < 2) return null;

            const owner = parts[0];
            const repo = parts[1];
            let branch = 'main';
            let path = '';

            if (parts[2] === 'tree' && parts.length >= 4) {
                branch = parts[3];
                path = parts.slice(4).join('/');
            }

            return { owner, repo, branch, path };
        } catch {
            return null;
        }
    };

    // Fetch textures from GitHub repository
    const handleGitHubImport = async () => {
        setGithubError(null);
        const parsed = parseGitHubUrl(githubUrl);

        if (!parsed) {
            setGithubError('Invalid GitHub URL. Use format: https://github.com/owner/repo or https://github.com/owner/repo/tree/branch/path');
            return;
        }

        setLoading(true);

        try {
            const { owner, repo, branch, path } = parsed;

            // Use GitHub API to get repo contents
            const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents`;
            const apiUrl = path ? `${apiBase}/${path}?ref=${branch}` : `${apiBase}?ref=${branch}`;

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Repository or path not found. Make sure the repo is public.');
                }
                if (response.status === 403) {
                    throw new Error('API rate limited. Please try again later or use ZIP import.');
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const contents = await response.json();
            const textures: FoundTexture[] = [];

            // Recursively find PNG files
            const findPngFiles = async (items: any[], currentPath: string = ''): Promise<void> => {
                for (const item of items) {
                    if (item.type === 'file' && item.name.endsWith('.png')) {
                        // Check if it's in a block texture path
                        const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
                        const parsed = parseTexturePath(fullPath);

                        if (parsed.type === 'block' || parsed.type === 'other') {
                            try {
                                // Fetch the image content
                                const rawUrl = item.download_url;
                                const imgResponse = await fetch(rawUrl);
                                const blob = await imgResponse.blob();
                                const base64 = await new Promise<string>((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result as string);
                                    reader.readAsDataURL(blob);
                                });

                                textures.push({
                                    name: parsed.modId ? `${parsed.modId}:${parsed.name}` : parsed.name,
                                    path: fullPath,
                                    data: base64
                                });
                            } catch (e) {
                                console.warn(`Failed to load texture: ${item.name}`, e);
                            }
                        }
                    } else if (item.type === 'dir') {
                        // Recurse into directory (with rate limiting consideration)
                        try {
                            const dirResponse = await fetch(item.url, {
                                headers: { 'Accept': 'application/vnd.github.v3+json' }
                            });
                            if (dirResponse.ok) {
                                const dirContents = await dirResponse.json();
                                const newPath = currentPath ? `${currentPath}/${item.name}` : item.name;
                                await findPngFiles(dirContents, newPath);
                            }
                        } catch (e) {
                            console.warn(`Failed to read directory: ${item.name}`, e);
                        }
                    }
                }
            };

            // Process contents
            if (Array.isArray(contents)) {
                await findPngFiles(contents, path);
            } else {
                setGithubError('Expected a directory. Please provide a path to a folder with textures.');
                setLoading(false);
                return;
            }

            if (textures.length === 0) {
                setGithubError('No PNG textures found in this repository/path. Try pointing to a folder with block textures.');
                setLoading(false);
                return;
            }

            const items = groupTextures(textures);
            setConfigList(items);
            setStep(2);

        } catch (err: any) {
            console.error('GitHub import error:', err);
            setGithubError(err.message || 'Failed to fetch from GitHub');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        const selectedItems = configList.filter(i => i.selected);
        if (selectedItems.length === 0) return;

        setLoading(true);

        let startId = getNextBlockId();
        const savedBlocks: CustomBlockData[] = [];
        let textureCounter = 0; // Counter for unique keys
        const importTimestamp = Date.now();
        const results: { success: boolean; name: string; error?: string }[] = [];

        // Process sequentially to avoid race conditions in Atlas
        for (const item of selectedItems) {
            try {
                const id = startId++;

                // Helper to load texture and return Atlas Key with guaranteed uniqueness
                const safeName = item.blockName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 32);

                const processTex = async (tex: FoundTexture, suffix: string): Promise<string | null> => {
                    // Use counter + id + timestamp for guaranteed uniqueness
                    const atlasKey = `cust_${id}_${safeName}_${suffix}_${importTimestamp}_${textureCounter++}`;
                    try {
                        await textureAtlas.addTextureFromData(atlasKey, tex.data);
                        return atlasKey;
                    } catch (error) {
                        console.error(`Failed to process texture ${tex.name}:`, error);
                        return null;
                    }
                };

                // We must store the raw data to persist correctly
                const textureDataMap: Record<string, string> = {};

                // Top
                const topKey = await processTex(item.textures.top, 'top');
                if (!topKey) throw new Error('Failed to load top texture');
                textureDataMap[topKey] = item.textures.top.data;

                // Side
                const sideKey = await processTex(item.textures.side, 'side');
                if (!sideKey) throw new Error('Failed to load side texture');
                textureDataMap[sideKey] = item.textures.side.data;

                // Bottom
                const botKey = await processTex(item.textures.bottom, 'bot');
                if (!botKey) throw new Error('Failed to load bottom texture');
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
                results.push({ success: true, name: item.blockName });
            } catch (error) {
                console.error(`Failed to import ${item.blockName}:`, error);
                results.push({ success: false, name: item.blockName, error: String(error) });
            }
        }

        // Persist via IndexedDB
        if (savedBlocks.length > 0) {
            try {
                await Storage.saveCustomBlocks(savedBlocks);
            } catch (e) {
                console.error("Storage failed", e);
                alert("Failed to save custom blocks to storage. Blocks will be lost on refresh.");
                setLoading(false);
                return; // Don't close modal on storage failure
            }
        }

        // Show summary if any failures
        const succeeded = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        if (failed > 0) {
            alert(`Import completed: ${succeeded} succeeded, ${failed} failed. Check console for details.`);
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
                        <div className="space-y-6">
                            {/* ZIP Upload Section */}
                            <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${isDay ? "border-gray-300 hover:border-blue-400 bg-gray-50" : "border-slate-700 hover:border-blue-500 bg-slate-800/50"}`}>
                                <Upload size={40} className="mb-3 opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">Upload Resource Pack (ZIP)</h3>
                                <p className="text-sm opacity-70 mb-4 max-w-md">
                                    Upload a .zip or .jar file containing textures.
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

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className={`flex-1 h-px ${isDay ? 'bg-gray-200' : 'bg-slate-700'}`} />
                                <span className="text-sm opacity-50">OR</span>
                                <div className={`flex-1 h-px ${isDay ? 'bg-gray-200' : 'bg-slate-700'}`} />
                            </div>

                            {/* GitHub Import Section */}
                            <div className={`rounded-xl p-6 ${isDay ? "bg-gray-50 border border-gray-200" : "bg-slate-800/50 border border-slate-700"}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <Globe size={20} className="opacity-70" />
                                    <h3 className="text-lg font-semibold">Import from GitHub</h3>
                                </div>
                                <p className="text-sm opacity-70 mb-4">
                                    Paste a GitHub repository URL with block textures. Works with public repos.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={githubUrl}
                                        onChange={(e) => { setGithubUrl(e.target.value); setGithubError(null); }}
                                        placeholder="https://github.com/owner/repo/tree/main/textures/block"
                                        className={`flex-1 px-4 py-2 rounded-lg border focus:border-blue-500 outline-none text-sm ${inputClass}`}
                                    />
                                    <button
                                        onClick={handleGitHubImport}
                                        disabled={loading || !githubUrl.trim()}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Link size={16} />
                                        Fetch
                                    </button>
                                </div>
                                {githubError && (
                                    <p className="text-red-500 text-sm mt-2">{githubError}</p>
                                )}
                                <p className="text-xs opacity-50 mt-3">
                                    Example: https://github.com/Faithful-Pack/Default-Java/tree/1.21.5/assets/minecraft/textures/block
                                </p>
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
                            onClick={() => { setStep(1); setConfigList([]); setGithubUrl(''); setGithubError(null); }}
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
