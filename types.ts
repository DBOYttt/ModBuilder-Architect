
// Basic types for the application
export interface VoxelPosition {
    x: number;
    y: number;
    z: number;
}

export interface BlockType {
    id: number;
    name: string;
    texture?: string;
    textures?: {
        top: string;
        side: string;
        bottom: string;
    };
    transparent?: boolean;
}

export type ToolType = 'place' | 'remove' | 'eyedropper' | 'fill' | 'select' | 'move';

export type ViewType = 'iso' | 'top' | 'front' | 'side';
