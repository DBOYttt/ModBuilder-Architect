
import { VoxelWorld } from '../VoxelWorld';

export interface BlockChange {
    x: number;
    y: number;
    z: number;
    prevId: number;
    prevRot: number;
    newId: number;
    newRot: number;
}

export type HistoryAction = BlockChange[];

export class HistoryManager {
    private undoStack: HistoryAction[] = [];
    private redoStack: HistoryAction[] = [];
    private maxHistory: number = 100;

    public push(action: HistoryAction) {
        if (action.length === 0) return;
        
        this.undoStack.push(action);
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }
        this.redoStack = []; // Clear redo stack on new action
    }

    public undo(world: VoxelWorld): boolean {
        const action = this.undoStack.pop();
        if (!action) return false;

        this.redoStack.push(action);

        world.beginBatch();
        // Revert changes (Apply previous state)
        for (let i = action.length - 1; i >= 0; i--) {
            const change = action[i];
            world.placeBlock(change.x, change.y, change.z, change.prevId, change.prevRot);
        }
        world.endBatch();
        return true;
    }

    public redo(world: VoxelWorld): boolean {
        const action = this.redoStack.pop();
        if (!action) return false;

        this.undoStack.push(action);

        world.beginBatch();
        // Apply changes (Apply new state)
        for (const change of action) {
            world.placeBlock(change.x, change.y, change.z, change.newId, change.newRot);
        }
        world.endBatch();
        return true;
    }

    public clear() {
        this.undoStack = [];
        this.redoStack = [];
    }

    public canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    public canRedo(): boolean {
        return this.redoStack.length > 0;
    }
}
