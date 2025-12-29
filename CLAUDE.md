# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

No test framework or linting is configured.

### Asset Scripts

```bash
node scripts/generate-blocks.cjs         # Regenerate blocks.ts from textures
node scripts/download-assets.cjs         # Download block textures
node scripts/download-entity-models.cjs  # Download entity models
```

## Architecture Overview

ModBuilder Architect is a 3D voxel building tool for creating Minecraft-style block structures. Uses React 19 with Three.js (via React Three Fiber) for 3D rendering.

### Core Systems

**VoxelWorld.ts** - Chunk-based voxel storage using `Uint16Array` for block IDs and `Uint8Array` for metadata (rotation). Chunks are 16x16x16 blocks.
- Batching system (`beginBatch()`/`endBatch()`) for bulk operations - always use for multi-block changes
- Greedy mesh generation with face culling
- Event system (`addChangeListener()`) for change notifications
- Material counting via `blockCounts` Map

**TextureAtlas.ts** - Dynamic 2048x2048 texture atlas with lazy loading:
- Singleton `textureAtlas` instance used app-wide
- `loadCategoryTextures(category)` for on-demand loading when UI expands block groups
- Different UV handling for blocks vs entity skins
- Textures at `public/minecraft/textures/`

**EntityRenderer.ts** - Renders 3D entity models (mob heads) separately from chunk meshes:
- Loads Bedrock format models via `EntityModels.ts` and `BedrockModelLoader.ts`
- **Known issues**: Some entities have texture mapping problems, complex models (dragon, wither) may have artifacts

**blocks.ts** - Block definitions using helper functions:
- `simple(id, name, texture)` - Uniform texture all sides
- `pillar(id, name, topTex, sideTex)` - Different top/bottom vs sides
- `unique(id, name, textures)` - Different texture per face
- `directional(id, name, textures)` - Rotatable blocks with front face
- Custom blocks stored in IndexedDB via `Storage.ts`

### React Components

**App.tsx** - Main state management, keyboard shortcuts, auto-save (30s to localStorage)

**Scene.tsx** - Three.js canvas with `WorldRenderer` and `CameraAnimator`. OrbitControls locked except in 'move' tool mode.

**BlockInteraction.tsx** - Raycast interaction:
- Left click: place/remove/fill depending on tool
- Right click: quick remove
- Alt+Right click: context menu
- Fill tool uses drag selection with batched placement

### Key Keyboard Shortcuts

- `Ctrl/Cmd+Z`: Undo | `Shift+Ctrl/Cmd+Z` or `Y`: Redo
- `R`: Rotate block before placing
- `PageUp/PageDown`: Navigate layers | `Home`: Show all layers

### State Management

- `HistoryManager.ts` - Undo/redo stack (100 max) storing block change deltas
- Layer visibility: `currentLayer` + `showAllLayers` state in App.tsx
- `ProjectManager.ts` - Save/load to localStorage, CSV export of material counts

### Types

Core types in `types.ts`:
- `ToolType`: 'place' | 'remove' | 'eyedropper' | 'fill' | 'select' | 'move'
- `ViewType`: 'iso' | 'top' | 'front' | 'side'
- `BlockType`: id, name, texture/textures, transparent flag

### Path Aliases

`@/*` maps to project root (tsconfig.json).
