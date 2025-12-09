# ModBuilder Architect

A powerful 3D voxel building tool for creating Minecraft-style block structures. Build, import custom textures, and export your creations.

![ModBuilder Architect](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## Features

- **3D Voxel Editor** - Place, remove, and manipulate blocks in a 3D environment
- **Block Library** - Extensive collection of Minecraft-style blocks organized by category
- **Custom Texture Import** - Import textures from mod zips and resource packs
- **Entity Support** - Add mob heads and entity models to your builds
- **Multiple Views** - Isometric, top-down, front, and side views
- **Layer System** - Work on specific layers with visibility controls
- **Project Management** - Save, load, and export your creations
- **Dark/Light Theme** - Comfortable building in any lighting condition

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Clone the repository:
   ```bash
   git clone git@github.com:DBOYttt/ModBuilder-Architect.git
   cd ModBuilder-Architect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Importing Custom Textures

ModBuilder Architect supports importing textures from:
- **Minecraft Resource Packs** (.zip)
- **Mod Files** (.jar, .zip)
- Supports standard mod structure: `assets/<modid>/textures/block/`

The importer automatically:
- Detects and groups related textures (top, side, bottom faces)
- Handles namespaced textures from mods
- Preserves texture organization by mod

## Controls

| Action | Control |
|--------|---------|
| Place Block | Left Click |
| Remove Block | Right Click |
| Rotate View | Hold Move tool + Drag |
| Pan View | Hold Move tool + Drag |
| Zoom | Scroll Wheel |
| Rotate Block | R key (when placing) |

## Tech Stack

- **React 19** - UI Framework
- **Three.js** - 3D Rendering
- **React Three Fiber** - React renderer for Three.js
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Project Structure

```
├── App.tsx              # Main application component
├── VoxelWorld.ts        # Voxel chunk management and rendering
├── TextureAtlas.ts      # Texture atlas management
├── EntityRenderer.ts    # Entity/mob head rendering
├── blocks.ts            # Block definitions
├── components/
│   ├── Scene.tsx        # 3D scene setup
│   ├── BlockInteraction.tsx  # Block placement logic
│   ├── ImportModal.tsx  # Texture import UI
│   └── Modals.tsx       # Various modal dialogs
└── utils/
    ├── ProjectManager.ts # Save/load functionality
    ├── Storage.ts       # IndexedDB storage
    └── HistoryManager.ts # Undo/redo system
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
