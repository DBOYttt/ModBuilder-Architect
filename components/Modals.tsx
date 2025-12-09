
import React, { useEffect, useState } from 'react';
import { X, HelpCircle, Command, MousePointer, Info, Check } from 'lucide-react';
import { BLOCKS } from '../blocks';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDay: boolean;
    children: React.ReactNode;
    title: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, isDay, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-lg rounded-xl shadow-2xl ${isDay ? "bg-white text-gray-800" : "bg-slate-900 text-slate-100"}`}>
                <div className={`p-4 border-b flex justify-between items-center ${isDay ? "border-gray-200" : "border-slate-700"}`}>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-black/10"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export const WelcomeModal: React.FC<{ isOpen: boolean; onClose: () => void; isDay: boolean }> = (props) => (
    <Modal {...props} title="Welcome to Voxel Builder!">
        <div className="space-y-4">
            <p className="opacity-80">Build your own 3D worlds with over 100+ Minecraft-style blocks. Here are some quick tips to get you started:</p>
            <ul className="space-y-2 text-sm">
                <li className="flex gap-2"><MousePointer size={16} className="mt-1 text-blue-500" /> Left Click to Place, Right Click to Remove.</li>
                <li className="flex gap-2"><Command size={16} className="mt-1 text-blue-500" /> Hold Left Click and Drag to Rotate View (Move Tool) or Fill (Fill Tool).</li>
                <li className="flex gap-2"><Info size={16} className="mt-1 text-blue-500" /> Use the Palette on the left to select blocks. Categories expand for more options.</li>
            </ul>
            <div className="pt-4 flex justify-end">
                <button onClick={props.onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Let's Build!</button>
            </div>
        </div>
    </Modal>
);

export const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void; isDay: boolean }> = (props) => (
    <Modal {...props} title="Keyboard Shortcuts & Help">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="col-span-2 font-semibold opacity-50 uppercase tracking-wider text-xs border-b pb-1 mb-1">General</div>
            <div className="flex justify-between"><span>Rotate Block</span> <kbd className="font-mono bg-black/10 px-1 rounded">R</kbd></div>
            <div className="flex justify-between"><span>Undo</span> <kbd className="font-mono bg-black/10 px-1 rounded">Ctrl + Z</kbd></div>
            <div className="flex justify-between"><span>Redo</span> <kbd className="font-mono bg-black/10 px-1 rounded">Ctrl + Y</kbd></div>
            
            <div className="col-span-2 font-semibold opacity-50 uppercase tracking-wider text-xs border-b pb-1 mb-1 mt-2">Tools</div>
            <div className="flex justify-between"><span>Move Camera</span> <kbd className="font-mono bg-black/10 px-1 rounded">Move Tool</kbd></div>
            <div className="flex justify-between"><span>Context Menu</span> <kbd className="font-mono bg-black/10 px-1 rounded">Alt + R-Click</kbd></div>
            
            <div className="col-span-2 font-semibold opacity-50 uppercase tracking-wider text-xs border-b pb-1 mb-1 mt-2">Layers</div>
            <div className="flex justify-between"><span>Next Layer</span> <kbd className="font-mono bg-black/10 px-1 rounded">Page Up</kbd></div>
            <div className="flex justify-between"><span>Prev Layer</span> <kbd className="font-mono bg-black/10 px-1 rounded">Page Down</kbd></div>
            <div className="flex justify-between"><span>Show All</span> <kbd className="font-mono bg-black/10 px-1 rounded">Home</kbd></div>
        </div>
    </Modal>
);

export const LoadingOverlay: React.FC<{ loading: boolean }> = ({ loading }) => {
    if (!loading) return null;
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-3 shadow-xl z-50 pointer-events-none">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-xs font-semibold">Loading Assets...</span>
        </div>
    );
};

export interface ContextMenuState {
    x: number;
    y: number;
    blockId: number;
    wx: number; wy: number; wz: number;
    biome?: string;
}

export const ContextMenu: React.FC<{ data: ContextMenuState | null; onClose: () => void; isDay: boolean }> = ({ data, onClose, isDay }) => {
    useEffect(() => {
        const handleClick = () => onClose();
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [onClose]);

    if (!data) return null;
    const block = BLOCKS[data.blockId];

    return (
        <div 
            className={`fixed z-50 rounded-lg shadow-xl border w-48 text-sm overflow-hidden ${isDay ? "bg-white border-gray-200 text-gray-800" : "bg-slate-800 border-slate-700 text-white"}`}
            style={{ top: data.y, left: data.x }}
        >
            <div className={`px-3 py-2 font-bold border-b ${isDay ? "bg-gray-50 border-gray-100" : "bg-slate-700/50 border-slate-700"}`}>
                {block ? block.name : 'Unknown Block'}
            </div>
            <div className="p-3 space-y-2">
                <div className="flex justify-between opacity-80">
                    <span>Pos:</span>
                    <span className="font-mono text-xs">{data.wx}, {data.wy}, {data.wz}</span>
                </div>
                <div className="flex justify-between opacity-80">
                    <span>ID:</span>
                    <span className="font-mono text-xs">{data.blockId}</span>
                </div>
                {block && (
                    <div className="flex justify-between opacity-80">
                        <span>Group:</span>
                        <span>{block.group}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
