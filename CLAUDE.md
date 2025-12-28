# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

No test framework is configured. No linting is configured.

## Architecture Overview

ModBuilder Architect is a 3D voxel building tool for creating Minecraft-style block structures. It uses React 19 with Three.js (via React Three Fiber) for 3D rendering.

### Core Systems

**VoxelWorld.ts** - Chunk-based voxel storage using `Uint16Array` for block IDs and `Uint8Array` for metadata (rotation). Chunks are 16x16x16 blocks. Key features:
- Batching system (`beginBatch()`/`endBatch()`) for bulk operations
- Greedy mesh generation with face culling
- Event system for change notifications

**TextureAtlas.ts** - Dynamic 2048x2048 texture atlas that loads textures on-demand:
- Lazy loading by category when block groups are expanded in UI
- Singleton instance `textureAtlas` used throughout the app
- Handles both regular blocks and entity skins with different UV layouts
- Textures fetched from bundled assets at `public/minecraft/textures/`

**EntityRenderer.ts** - Renders 3D entity models (mob heads) separately from chunk meshes:
- Loads Bedrock format models via `EntityModels.ts` and `BedrockModelLoader.ts`
- Uses UV mapping based on Minecraft's box UV layout
- Positioned at block centers with rotation support

**blocks.ts** - Block definitions with helper functions:
- `simple()` - Uniform texture on all sides
- `pillar()` - Different top/bottom vs sides
- `unique()` - Different texture per face
- `directional()` - Rotatable blocks with front face
- Custom blocks stored in IndexedDB via `Storage.ts`

### React Component Structure

**App.tsx** - Main component managing:
- Keyboard shortcuts (Ctrl+Z undo, R rotate, PageUp/Down layers)
- Auto-save every 30 seconds to localStorage
- Block category expansion triggers texture preloading

**Scene.tsx** - Three.js canvas setup with:
- `WorldRenderer` - Adds voxel meshes and entity renderer to scene
- `CameraAnimator` - Smooth camera transitions between views
- OrbitControls locked except in 'move' tool mode

**BlockInteraction.tsx** - Mouse/raycast interaction handling:
- Left click: place/remove/fill depending on tool
- Right click: quick remove
- Alt+Right click: context menu
- Fill tool uses drag selection with batched block placement

### State Management

- `HistoryManager.ts` - Undo/redo stack (100 max) storing block changes
- Layer visibility controlled by `currentLayer` + `showAllLayers` state
- Material counts tracked in `VoxelWorld.blockCounts` Map

### Path Aliases

`@/*` maps to the project root (configured in tsconfig.json).
