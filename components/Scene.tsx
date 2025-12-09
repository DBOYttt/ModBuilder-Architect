
import React, { useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { textureAtlas } from '../TextureAtlas';
import { VoxelWorld } from '../VoxelWorld';
import { EntityRenderer } from '../EntityRenderer';
import { BlockInteraction } from './BlockInteraction';
import { ToolType, ViewType } from '../types';
import { HistoryManager } from '../utils/HistoryManager';
import { ContextMenuState } from './Modals';

interface SceneProps {
    voxelWorld: VoxelWorld;
    tool: ToolType;
    selectedBlockId: number;
    setSelectedBlockId: (id: number) => void;
    theme: 'day' | 'night';
    currentView: ViewType;
    currentLayer: number;
    showAllLayers: boolean;
    onMaxLayerFound?: (maxLayer: number) => void;
    onMaterialsUpdate?: (counts: Map<number, number>) => void;
    rotation?: number; 
    historyManager: HistoryManager;
    onHistoryChange: () => void;
    onOpenContextMenu?: (data: ContextMenuState) => void;
}

const Lights: React.FC<{ theme: 'day' | 'night' }> = ({ theme }) => {
    const isDay = theme === 'day';
    return (
        <>
            <ambientLight intensity={isDay ? 0.6 : 0.5} />
            <directionalLight 
                position={[50, 80, 50]} 
                intensity={isDay ? 1 : 0.8} 
                castShadow 
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
                color={isDay ? "#ffffff" : "#cceeff"}
            />
            <hemisphereLight 
                args={[
                    isDay ? "#ffffff" : "#1e293b", 
                    isDay ? "#444444" : "#111111", 
                    0.5
                ]} 
            />
        </>
    );
};

const SceneEnvironment: React.FC<{ theme: 'day' | 'night' }> = ({ theme }) => {
    const bgColor = theme === 'day' ? '#87CEEB' : '#0f172a';
    return (
        <>
            <color attach="background" args={[bgColor]} />
            <fog attach="fog" args={[bgColor, 20, 100]} />
            <gridHelper 
                args={[100, 100, 
                    theme === 'day' ? 0x888888 : 0x666666, 
                    theme === 'day' ? 0xcccccc : 0x333333
                ]} 
                position={[0, -0.01, 0]} 
            />
        </>
    );
};

const WorldRenderer: React.FC<{
    voxelWorld: VoxelWorld,
    onMaxLayerFound?: (n: number) => void
}> = ({ voxelWorld, onMaxLayerFound }) => {
    const { scene } = useThree();
    const entityRendererRef = useRef<EntityRenderer | null>(null);
    const lastEntityUpdateRef = useRef<number>(0);

    useEffect(() => {
        const group = voxelWorld.group;
        scene.add(group);

        // Initialize entity renderer
        entityRendererRef.current = new EntityRenderer();
        scene.add(entityRendererRef.current.group);

        return () => {
            scene.remove(group);
            if (entityRendererRef.current) {
                scene.remove(entityRendererRef.current.group);
                entityRendererRef.current.dispose();
            }
        };
    }, [scene, voxelWorld]);

    // Listen for world changes to update entities
    useEffect(() => {
        const handleChange = () => {
            if (entityRendererRef.current) {
                const entities = voxelWorld.getEntityInstances();
                entityRendererRef.current.updateEntities(entities);
            }
        };

        voxelWorld.addChangeListener(handleChange);
        // Initial update
        handleChange();

        return () => {
            voxelWorld.removeChangeListener(handleChange);
        };
    }, [voxelWorld]);

    useFrame(({ clock }) => {
        if (onMaxLayerFound && clock.elapsedTime % 1 < 0.1) {
             onMaxLayerFound(voxelWorld.getMaxLayer());
        }

        // Periodic entity update (in case textures loaded late)
        if (entityRendererRef.current && clock.elapsedTime - lastEntityUpdateRef.current > 2) {
            const entities = voxelWorld.getEntityInstances();
            entityRendererRef.current.updateEntities(entities);
            lastEntityUpdateRef.current = clock.elapsedTime;
        }
    });

    return null;
};

const CameraAnimator: React.FC<{ view: ViewType }> = ({ view }) => {
    const { camera, controls } = useThree();
    const targetPos = useRef(new THREE.Vector3(20, 20, 20));
    const startPos = useRef(new THREE.Vector3());
    const startTime = useRef(0);
    const isAnimating = useRef(false);

    useEffect(() => {
        let pos = new THREE.Vector3();
        const dist = 40;
        
        switch (view) {
            case 'top': pos.set(0, dist, 0.01); break;
            case 'front': pos.set(0, 0, dist); break;
            case 'side': pos.set(dist, 0, 0); break;
            case 'iso': default: pos.set(20, 20, 20); break;
        }

        startPos.current.copy(camera.position);
        targetPos.current.copy(pos);
        startTime.current = Date.now();
        isAnimating.current = true;

    }, [view, camera]);

    useFrame(() => {
        if (!isAnimating.current) return;
        const now = Date.now();
        const duration = 500;
        const progress = Math.min((now - startTime.current) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        camera.position.lerpVectors(startPos.current, targetPos.current, ease);
        if (progress >= 1) isAnimating.current = false;
    });

    return null;
};

const Scene: React.FC<SceneProps> = ({ 
    voxelWorld,
    tool, 
    selectedBlockId, 
    setSelectedBlockId, 
    theme, 
    currentView,
    currentLayer,
    showAllLayers,
    onMaxLayerFound,
    onMaterialsUpdate,
    rotation = 0,
    historyManager,
    onHistoryChange,
    onOpenContextMenu
}) => {
    useEffect(() => {
        voxelWorld.setLayerLimit(currentLayer, !showAllLayers);
    }, [currentLayer, showAllLayers, voxelWorld]);

    useEffect(() => {
        const handleUpdate = () => {
            if (onMaterialsUpdate) {
                onMaterialsUpdate(new Map(voxelWorld.getBlockCounts()));
            }
        };
        voxelWorld.addChangeListener(handleUpdate);
        return () => { voxelWorld.removeChangeListener(handleUpdate); };
    }, [onMaterialsUpdate, voxelWorld]);

    useEffect(() => {
        const mat = textureAtlas.getMaterial();
        mat.clippingPlanes = []; 
        mat.needsUpdate = true;
    }, []);

    return (
        <Canvas
            shadows
            dpr={[1, 2]} 
            gl={{ antialias: true, preserveDrawingBuffer: true }} 
            camera={{ position: [20, 20, 20], fov: 45, near: 0.1, far: 1000 }}
            className="w-full h-full block"
        >
            <SceneEnvironment theme={theme} />
            <Lights theme={theme} />
            <CameraAnimator view={currentView} />
            <OrbitControls makeDefault minDistance={5} maxDistance={100} enableRotate={tool === 'move'} enablePan={tool === 'move'} />
            
            {!showAllLayers && (
                <gridHelper args={[100, 100, 0x3b82f6, 0x3b82f6]} position={[0.5, currentLayer + 1.01, 0.5]} />
            )}

            <WorldRenderer voxelWorld={voxelWorld} onMaxLayerFound={onMaxLayerFound} />
            <BlockInteraction 
                voxelWorld={voxelWorld}
                tool={tool}
                selectedBlockId={selectedBlockId}
                setSelectedBlockId={setSelectedBlockId}
                currentLayer={currentLayer}
                showAllLayers={showAllLayers}
                rotation={rotation}
                historyManager={historyManager}
                onHistoryChange={onHistoryChange}
                onOpenContextMenu={onOpenContextMenu}
            />
        </Canvas>
    );
};

export default Scene;
