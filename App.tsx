
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Scene from './components/Scene';
import {
    Box, Trash2, Pipette, Sun, Moon, Search,
    ChevronDown, ChevronRight, Hand, Grid3X3,
    ArrowDownToLine, Move3d, RectangleVertical, RectangleHorizontal,
    Move, Layers, Eye, EyeOff, ChevronUp, ScrollText, CheckSquare,
    Save, FolderOpen, FilePlus, Download, Image as ImageIcon, FileSpreadsheet, FileArchive, UploadCloud,
    RotateCw, Undo, Redo, HelpCircle, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen
} from 'lucide-react';
import { ToolType, ViewType } from './types';
import { VoxelWorld } from './VoxelWorld';
import { BLOCKS, BlockDef, CustomBlockData, registerCustomBlock } from './blocks';
import { ProjectManager } from './utils/ProjectManager';
import { ImportModal } from './components/ImportModal';
import { WelcomeModal, HelpModal, LoadingOverlay, ContextMenu, ContextMenuState } from './components/Modals';
import { textureAtlas } from './TextureAtlas';
import { Storage } from './utils/Storage';
import { HistoryManager } from './utils/HistoryManager';

const App: React.FC = () => {
  const [voxelWorld] = useState(() => new VoxelWorld());
  const [historyManager] = useState(() => new HistoryManager());
  
  const [tool, setTool] = useState<ToolType>('place');
  const [selectedBlockId, setSelectedBlockId] = useState<number>(10);
  const [rotation, setRotation] = useState<number>(0); 
  
  const [theme, setTheme] = useState<'day' | 'night'>('night');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('iso');
  
  const [currentLayer, setCurrentLayer] = useState<number>(5);
  const [showAllLayers, setShowAllLayers] = useState<boolean>(true);
  const [maxLayer, setMaxLayer] = useState<number>(10);

  const [materialCounts, setMaterialCounts] = useState<Map<number, number>>(new Map());
  const [gatheredMaterials, setGatheredMaterials] = useState<Record<number, boolean>>({});

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Modals & Polish
  const [showWelcome, setShowWelcome] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isLoadingTextures, setIsLoadingTextures] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Sidebar visibility for responsive layout
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  const [blocksVersion, setBlocksVersion] = useState(0);
  const [historyVersion, setHistoryVersion] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
      'Building': false,
      'Nature': false,
      'Decoration': false,
      'Redstone': false,
      'Utility': false,
      'Nether': false,
      'Entities': false,
      'Custom': true
  });

  const isDay = theme === 'day';
  const allBlocks = useMemo(() => Object.values(BLOCKS).filter(b => b.id !== 0), [blocksVersion]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                if (historyManager.redo(voxelWorld)) setHistoryVersion(v => v + 1);
            } else {
                if (historyManager.undo(voxelWorld)) setHistoryVersion(v => v + 1);
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
             e.preventDefault();
             if (historyManager.redo(voxelWorld)) setHistoryVersion(v => v + 1);
        }
        if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
            setRotation(prev => (prev + 1) % 4);
        }
        if (e.key === 'PageUp') {
            setCurrentLayer(l => l + 1); setShowAllLayers(false);
        }
        if (e.key === 'PageDown') {
            setCurrentLayer(l => Math.max(0, l - 1)); setShowAllLayers(false);
        }
        if (e.key === 'Home') {
            setShowAllLayers(true);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voxelWorld, historyManager]);

  // Init & Persistence
  useEffect(() => {
    const hasVisited = localStorage.getItem('voxel_welcome_seen');
    if (!hasVisited) setShowWelcome(true);

    const init = async () => {
        try {
            const customBlocks = await Storage.loadCustomBlocks();
            if (customBlocks.length > 0) {
                for (const block of customBlocks) {
                    if (block.textureData) {
                        for (const [texName, base64] of Object.entries(block.textureData)) {
                            await textureAtlas.addTextureFromData(texName, base64);
                        }
                    }
                }
                customBlocks.forEach(registerCustomBlock);
                setBlocksVersion(v => v + 1);
            }
        } catch (e) { console.error("Failed to load custom blocks", e); }

        const usedIds = Array.from(new Set(voxelWorld.getAllBlocks().map(b => b.id)));
        if (usedIds.length > 0) {
            await textureAtlas.preloadUsedBlocks(usedIds);
        } else {
            await textureAtlas.preloadUsedBlocks([1, 2, 3, 10, 30]);
        }
    };
    init();

    // Loading State Listener
    return textureAtlas.onLoadStateChange(setIsLoadingTextures);
  }, [voxelWorld]);

  // Auto-Save
  useEffect(() => {
    const interval = setInterval(() => {
        if (voxelWorld.getAllBlocks().length > 0) {
            const data = { 
                name: 'AutoSave', version: 1, created: new Date().toISOString(), 
                blocks: voxelWorld.getAllBlocks() 
            };
            localStorage.setItem('voxel_autosave', JSON.stringify(data));
        }
    }, 30000);
    return () => clearInterval(interval);
  }, [voxelWorld]);

  // Before Unload Warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (voxelWorld.getAllBlocks().length > 0) {
            e.preventDefault();
            e.returnValue = '';
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [voxelWorld]);

  // Texture Updates
  useEffect(() => {
      let timeout: any;
      const updateWorld = () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => voxelWorld.updateAllChunks(), 100); 
      };
      const cleanup = textureAtlas.onLoad(updateWorld);
      return () => { cleanup(); clearTimeout(timeout); };
  }, [voxelWorld]);

  const toggleGroup = (group: string) => {
      const isExpanding = !expandedGroups[group];
      setExpandedGroups(prev => ({ ...prev, [group]: isExpanding }));
      if (isExpanding) {
          textureAtlas.loadTexturesForCategory(group, allBlocks);
      }
  };

  const groupedBlocks = useMemo(() => {
      const groups: Record<string, Record<string, BlockDef[]>> = {};
      allBlocks.forEach(block => {
          if (searchQuery && !block.name.toLowerCase().includes(searchQuery.toLowerCase())) return;
          if (!groups[block.group]) groups[block.group] = {};
          if (!groups[block.group][block.category]) groups[block.group][block.category] = [];
          groups[block.group][block.category].push(block);
      });
      return groups;
  }, [searchQuery, allBlocks]);

  const handleNewProject = () => {
      if (window.confirm('Clear project? Unsaved changes will be lost.')) {
          voxelWorld.clear();
          historyManager.clear();
          setHistoryVersion(0);
          setMaterialCounts(new Map());
          setGatheredMaterials({});
      }
  };

  const handleSaveProject = () => ProjectManager.saveProject(voxelWorld, 'My_Voxel_Project');
  const handleOpenClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          try {
              await ProjectManager.loadProject(file, voxelWorld);
              historyManager.clear();
              setHistoryVersion(0);
              const usedIds = Array.from(new Set(voxelWorld.getAllBlocks().map(b => b.id)));
              await textureAtlas.preloadUsedBlocks(usedIds);
          } catch (err) { alert('Failed to load project.'); }
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleExportPNG = () => {
     const canvas = document.querySelector('canvas');
     if (canvas) {
         const link = document.createElement('a');
         link.download = 'voxel_view.png';
         link.href = canvas.toDataURL('image/png');
         link.click();
     }
     setShowExportMenu(false);
  };
  const handleExportLayers = async () => { await ProjectManager.exportLayerImages(voxelWorld); setShowExportMenu(false); };
  const handleExportCSV = () => { ProjectManager.exportMaterialsCSV(materialCounts); setShowExportMenu(false); };
  const handleImportComplete = () => setBlocksVersion(v => v + 1);

  const handleUndo = () => { if (historyManager.undo(voxelWorld)) setHistoryVersion(v => v + 1); };
  const handleRedo = () => { if (historyManager.redo(voxelWorld)) setHistoryVersion(v => v + 1); };
  const onHistoryChange = () => setHistoryVersion(v => v + 1);

  const getTextureUrl = (textureName: string) => {
      const block = Object.values(BLOCKS).find(b => b.textures.top === textureName || b.textures.side === textureName) as CustomBlockData | undefined;
      if (block && block.textureData && block.textureData[textureName]) return block.textureData[textureName];
      if (block && block.group === 'Entities') return `https://raw.githubusercontent.com/Faithful-Pack/Default-Java/1.21.5/assets/minecraft/textures/entity/${block.textures.side}.png`;
      return `https://raw.githubusercontent.com/Faithful-Pack/Default-Java/1.21.5/assets/minecraft/textures/block/${textureName}.png`;
  };

  const sortedMaterials = useMemo(() => {
      const entries = Array.from(materialCounts.entries());
      entries.sort((a, b) => b[1] - a[1]);
      return entries.map(([id, count]) => ({ block: BLOCKS[id], count, stacks: (count / 64) })).filter(item => item.block !== undefined);
  }, [materialCounts, blocksVersion]);

  // Styles
  const panelClasses = isDay ? "bg-white border-t border-gray-200 text-gray-800" : "bg-slate-900 border-t border-slate-700 text-slate-100";
  const sidebarClasses = isDay ? "bg-white border-r border-gray-200" : "bg-slate-900 border-r border-slate-800 text-slate-100";
  const rightSidebarClasses = isDay ? "bg-white border-l border-gray-200" : "bg-slate-900 border-l border-slate-800 text-slate-100";
  const getBtnClass = (active: boolean) => active ? "bg-blue-600 text-white shadow-sm" : (isDay ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-slate-700 text-slate-300 hover:bg-slate-600");
  const getDisabledClass = (disabled: boolean) => disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <div className="w-full h-full relative flex overflow-hidden font-sans select-none">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      
      {/* Modals */}
      <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImportComplete={handleImportComplete} isDay={isDay} />
      <WelcomeModal isOpen={showWelcome} onClose={() => { setShowWelcome(false); localStorage.setItem('voxel_welcome_seen', 'true'); }} isDay={isDay} />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} isDay={isDay} />
      <LoadingOverlay loading={isLoadingTextures} />
      <ContextMenu data={contextMenu} onClose={() => setContextMenu(null)} isDay={isDay} />

      {/* LEFT SIDEBAR */}
      <div className={`${showLeftSidebar ? 'w-72 lg:w-80' : 'w-12'} flex-shrink-0 flex flex-col z-20 transition-all duration-300 ${sidebarClasses}`}>
          <div className={`p-2 ${showLeftSidebar ? 'p-4' : 'p-2'} border-b border-inherit`}>
              <div className="flex items-center gap-2 mb-4 justify-between">
                  {showLeftSidebar && (
                    <div className="flex items-center gap-2">
                      <Box className="w-6 h-6 text-blue-500" />
                      <h1 className="text-lg lg:text-xl font-bold">Voxel Builder</h1>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {showLeftSidebar && (
                      <button onClick={() => setShowHelp(true)} className={`p-1 rounded-full ${isDay ? "hover:bg-gray-100 text-gray-400" : "hover:bg-slate-700 text-slate-500"}`} title="Help">
                          <HelpCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => setShowLeftSidebar(!showLeftSidebar)} className={`p-1 rounded-full ${isDay ? "hover:bg-gray-100 text-gray-500" : "hover:bg-slate-700 text-slate-400"}`} title={showLeftSidebar ? "Collapse Sidebar" : "Expand Sidebar"}>
                        {showLeftSidebar ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                    </button>
                  </div>
              </div>
              {showLeftSidebar && (
                <>
                  <div className="flex gap-2 mb-4">
                      <button onClick={handleNewProject} className={`flex-1 p-2 rounded flex justify-center items-center gap-2 text-xs font-semibold ${isDay ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'}`}><FilePlus size={14} /> New</button>
                      <button onClick={handleOpenClick} className={`flex-1 p-2 rounded flex justify-center items-center gap-2 text-xs font-semibold ${isDay ? 'bg-gray-100 hover:bg-gray-200' : 'bg-slate-800 hover:bg-slate-700'}`}><FolderOpen size={14} /> Open</button>
                      <button onClick={handleSaveProject} className={`flex-1 p-2 rounded flex justify-center items-center gap-2 text-xs font-semibold ${isDay ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'}`}><Save size={14} /> Save</button>
                      <div className="relative">
                        <button onClick={() => setShowExportMenu(!showExportMenu)} className={`h-full aspect-square rounded flex justify-center items-center ${isDay ? 'bg-gray-100 hover:bg-gray-200' : 'bg-slate-800 hover:bg-slate-700'}`}><Download size={14} /></button>
                        {showExportMenu && (
                            <div className={`absolute top-full right-0 mt-1 w-48 rounded-lg shadow-xl border z-50 flex flex-col p-1 ${isDay ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-700'}`}>
                                <button onClick={handleExportPNG} className={`p-2 text-left text-sm rounded flex items-center gap-2 ${isDay ? 'hover:bg-gray-100' : 'hover:bg-slate-700'}`}><ImageIcon size={14} /> Export PNG</button>
                                <button onClick={handleExportLayers} className={`p-2 text-left text-sm rounded flex items-center gap-2 ${isDay ? 'hover:bg-gray-100' : 'hover:bg-slate-700'}`}><FileArchive size={14} /> Layers (ZIP)</button>
                                <button onClick={handleExportCSV} className={`p-2 text-left text-sm rounded flex items-center gap-2 ${isDay ? 'hover:bg-gray-100' : 'hover:bg-slate-700'}`}><FileSpreadsheet size={14} /> CSV</button>
                            </div>
                        )}
                      </div>
                  </div>
                  <div className="flex gap-2 mb-2">
                      <div className="relative flex-grow">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-9 pr-4 py-2 rounded-md text-sm outline-none border transition-colors ${isDay ? "bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 text-gray-800" : "bg-slate-800 border-transparent focus:bg-slate-700 focus:border-blue-500 text-slate-100"}`} />
                      </div>
                      <button onClick={() => setShowImportModal(true)} title="Import Custom Block" className={`p-2 rounded-md transition-colors ${isDay ? 'bg-gray-100 hover:bg-gray-200' : 'bg-slate-800 hover:bg-slate-700'}`}><UploadCloud size={20} className="text-blue-500" /></button>
                  </div>
                </>
              )}
          </div>
          {showLeftSidebar && <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
              {Object.keys(groupedBlocks).sort().map(group => (
                  <div key={group} className="mb-2">
                      <button onClick={() => toggleGroup(group)} className={`w-full flex items-center gap-2 p-2 rounded-md text-sm font-semibold transition-colors ${isDay ? "hover:bg-gray-100 text-gray-700" : "hover:bg-slate-800 text-slate-300"}`}>
                          {expandedGroups[group] || searchQuery ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          {group}
                      </button>
                      {(expandedGroups[group] || searchQuery) && (
                          <div className="pl-2 mt-1 space-y-4">
                              {Object.keys(groupedBlocks[group]).sort().map(category => (
                                  <div key={category}>
                                      <h4 className={`text-xs font-medium uppercase tracking-wider mb-2 pl-2 ${isDay ? "text-gray-400" : "text-slate-500"}`}>{category}</h4>
                                      <div className="grid grid-cols-5 gap-1.5 px-2">
                                          {groupedBlocks[group][category].map(block => (
                                              <button key={block.id} onClick={() => { setSelectedBlockId(block.id); setTool('place'); }} title={block.name} className={`aspect-square rounded-md p-1 border-2 transition-all group relative ${selectedBlockId === block.id ? "border-blue-500 bg-blue-500/10" : "border-transparent hover:bg-black/5 dark:hover:bg-white/5"}`}>
                                                  <div className="w-full h-full overflow-hidden rounded-sm">
                                                    <img src={getTextureUrl(block.textures.side || block.textures.top)} alt={block.name} className={`w-full h-full object-contain pixelated ${block.group === 'Entities' ? 'scale-150' : ''}`} loading="lazy" />
                                                  </div>
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              ))}
          </div>}
      </div>

      {/* CENTER */}
      <div className="flex-grow flex flex-col h-full relative z-0 bg-black">
        <div className="flex-grow relative">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className={`pointer-events-auto backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border flex items-center gap-2 ${isDay ? "bg-white/90 border-gray-200" : "bg-slate-800/90 border-slate-700"}`}>
                     <RotateCw size={14} className={isDay ? "text-gray-500" : "text-slate-400"} />
                     <span className={`text-xs font-mono font-bold ${isDay ? "text-gray-700" : "text-slate-200"}`}>ROT: {rotation * 90}°</span>
                     <span className={`text-[10px] ml-1 opacity-50 uppercase`}>[R]</span>
                </div>
            </div>

            <Scene 
                voxelWorld={voxelWorld} 
                tool={tool} 
                selectedBlockId={selectedBlockId} 
                setSelectedBlockId={setSelectedBlockId} 
                theme={theme} 
                currentView={currentView} 
                currentLayer={currentLayer} 
                showAllLayers={showAllLayers} 
                onMaxLayerFound={setMaxLayer} 
                onMaterialsUpdate={setMaterialCounts}
                rotation={rotation}
                historyManager={historyManager}
                onHistoryChange={onHistoryChange}
                onOpenContextMenu={setContextMenu}
            />
            
            <div className="absolute top-4 right-4 flex gap-2 pointer-events-none">
                <div className={`pointer-events-auto backdrop-blur-sm p-2 rounded-lg shadow-lg border ${isDay ? "bg-white/90 border-gray-200" : "bg-slate-800/90 border-slate-700"}`}>
                    <button onClick={() => setTheme(isDay ? 'night' : 'day')} className={`p-2 rounded-full transition-colors ${isDay ? 'hover:bg-gray-100 text-orange-500' : 'hover:bg-slate-700 text-yellow-400'}`}>{isDay ? <Sun size={20} /> : <Moon size={20} />}</button>
                </div>
            </div>
        </div>
        {/* Toolbar */}
        <div className={`flex-shrink-0 h-16 flex items-center justify-between px-6 shadow-xl z-10 overflow-x-auto ${panelClasses}`}>
            <div className="flex items-center gap-3 min-w-max">
                <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                    <button onClick={handleUndo} disabled={!historyManager.canUndo()} className={`p-2 rounded-md transition-all ${getBtnClass(false)} ${getDisabledClass(!historyManager.canUndo())}`} title="Undo (Ctrl+Z)"><Undo size={20} /></button>
                    <button onClick={handleRedo} disabled={!historyManager.canRedo()} className={`p-2 rounded-md transition-all ${getBtnClass(false)} ${getDisabledClass(!historyManager.canRedo())}`} title="Redo (Ctrl+Y)"><Redo size={20} /></button>
                </div>
                <div className={`h-8 w-px mx-2 ${isDay ? 'bg-gray-300' : 'bg-slate-700'}`}></div>

                <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg">
                    <button onClick={() => setTool('move')} className={`p-2 rounded-md transition-all ${getBtnClass(tool === 'move')}`} title="Move Camera"><Move size={20} /></button>
                    <button onClick={() => setTool('select')} className={`p-2 rounded-md transition-all ${getBtnClass(tool === 'select')}`} title="Select/Inspect"><Hand size={20} /></button>
                    <button onClick={() => setTool('place')} className={`p-2 rounded-md transition-all ${getBtnClass(tool === 'place')}`} title="Place Block"><Box size={20} /></button>
                    <button onClick={() => setTool('remove')} className={`p-2 rounded-md transition-all ${getBtnClass(tool === 'remove')}`} title="Remove Block"><Trash2 size={20} /></button>
                    <button onClick={() => setTool('fill')} className={`p-2 rounded-md transition-all ${getBtnClass(tool === 'fill')}`} title="Fill Area (Drag)"><Grid3X3 size={20} /></button>
                    <button onClick={() => setTool('eyedropper')} className={`p-2 rounded-md transition-all ${getBtnClass(tool === 'eyedropper')}`} title="Pick Block"><Pipette size={20} /></button>
                </div>
                <div className={`h-8 w-px mx-2 ${isDay ? 'bg-gray-300' : 'bg-slate-700'}`}></div>
                <div className="flex gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-lg items-center">
                    <button onClick={() => { setCurrentLayer(l => Math.max(0, l - 1)); setShowAllLayers(false); }} className={`p-2 rounded-md transition-all ${getBtnClass(false)}`} title="Previous Layer (PgDn)"><ChevronDown size={20} /></button>
                    <div className="px-3 flex flex-col items-center justify-center min-w-[80px]">
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Layer</span>
                        <span className="text-sm font-mono">{currentLayer} / {maxLayer}</span>
                    </div>
                    <button onClick={() => { setCurrentLayer(l => l + 1); setShowAllLayers(false); }} className={`p-2 rounded-md transition-all ${getBtnClass(false)}`} title="Next Layer (PgUp)"><ChevronUp size={20} /></button>
                    <button onClick={() => setShowAllLayers(!showAllLayers)} className={`p-2 rounded-md transition-all ml-1 ${getBtnClass(showAllLayers)}`} title="Toggle All Layers (Home)">{showAllLayers ? <Eye size={20} /> : <EyeOff size={20} />}</button>
                </div>
                <div className={`h-8 w-px mx-2 ${isDay ? 'bg-gray-300' : 'bg-slate-700'}`}></div>
                <div className="flex gap-1">
                    <button onClick={() => setCurrentView('iso')} className={`p-2 rounded-md transition-all ${getBtnClass(currentView === 'iso')}`} title="Isometric View"><Move3d size={20} /></button>
                    <button onClick={() => setCurrentView('top')} className={`p-2 rounded-md transition-all ${getBtnClass(currentView === 'top')}`} title="Top View"><ArrowDownToLine size={20} /></button>
                    <button onClick={() => setCurrentView('front')} className={`p-2 rounded-md transition-all ${getBtnClass(currentView === 'front')}`} title="Front View"><RectangleHorizontal size={20} /></button>
                    <button onClick={() => setCurrentView('side')} className={`p-2 rounded-md transition-all ${getBtnClass(currentView === 'side')}`} title="Side View"><RectangleVertical size={20} /></button>
                </div>
            </div>
            <div className={`text-xs min-w-max ml-4 ${isDay ? "text-gray-500" : "text-slate-500"}`}><span className="hidden md:inline">Right Click to Quick Remove. [R] to Rotate.</span></div>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div className={`${showRightSidebar ? 'w-64 lg:w-72' : 'w-12'} flex-shrink-0 flex flex-col z-20 transition-all duration-300 ${rightSidebarClasses}`}>
          <div className="p-2 lg:p-4 border-b border-inherit flex items-center justify-between gap-2">
              <button onClick={() => setShowRightSidebar(!showRightSidebar)} className={`p-1 rounded-full ${isDay ? "hover:bg-gray-100 text-gray-500" : "hover:bg-slate-700 text-slate-400"}`} title={showRightSidebar ? "Collapse Materials" : "Expand Materials"}>
                  {showRightSidebar ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              </button>
              {showRightSidebar && (
                <div className="flex items-center gap-2 flex-grow">
                  <ScrollText className="w-5 h-5 text-blue-500" />
                  <h2 className="text-base lg:text-lg font-bold">Materials</h2>
                </div>
              )}
          </div>
          {showRightSidebar && (
            <>
              <div className="flex-1 overflow-y-auto p-2 lg:p-4 scrollbar-thin space-y-2">
                  {sortedMaterials.length === 0 ? <div className={`text-center py-8 text-sm ${isDay ? "text-gray-400" : "text-slate-600"}`}>No blocks placed yet.</div> : sortedMaterials.map(({ block, count, stacks }) => (
                      <div key={block.id} className={`flex items-center gap-2 lg:gap-3 p-2 rounded-lg border transition-all ${isDay ? "bg-gray-50/50 border-gray-100" : "bg-slate-800/50 border-slate-700/50"} ${gatheredMaterials[block.id] ? "opacity-50" : "opacity-100"}`}>
                          <button onClick={() => setGatheredMaterials(prev => ({...prev, [block.id]: !prev[block.id]}))} className={`flex-shrink-0 transition-colors ${gatheredMaterials[block.id] ? "text-green-500" : (isDay ? "text-gray-300 hover:text-gray-400" : "text-slate-600 hover:text-slate-500")}`}><CheckSquare size={18} /></button>
                          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded p-0.5 bg-black/10 dark:bg-white/10 flex-shrink-0"><img src={getTextureUrl(block.textures.side || block.textures.top)} alt={block.name} className="w-full h-full object-contain pixelated" /></div>
                          <div className="flex-grow min-w-0"><div className={`text-xs lg:text-sm font-medium truncate ${gatheredMaterials[block.id] ? "line-through" : ""}`}>{block.name}</div><div className={`text-xs ${isDay ? "text-gray-500" : "text-slate-400"}`}>×{count} {count >= 64 && <span className="opacity-75">({stacks % 1 === 0 ? stacks : stacks.toFixed(1)} stacks)</span>}</div></div>
                      </div>
                  ))}
              </div>
              {sortedMaterials.length > 0 && <div className={`p-3 border-t text-xs text-center border-inherit ${isDay ? "text-gray-400" : "text-slate-600"}`}>Total: {Array.from(materialCounts.values()).reduce((a, b) => a + b, 0)}</div>}
            </>
          )}
      </div>
    </div>
  );
};
export default App;
