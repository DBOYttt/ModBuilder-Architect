
import React, { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VoxelWorld } from '../VoxelWorld';
import { ToolType } from '../types';
import { HistoryManager, BlockChange } from '../utils/HistoryManager';
import { ContextMenuState } from './Modals';

interface BlockInteractionProps {
    voxelWorld: VoxelWorld;
    tool: ToolType;
    selectedBlockId: number;
    setSelectedBlockId: (id: number) => void;
    currentLayer: number;
    showAllLayers: boolean;
    rotation: number;
    historyManager: HistoryManager;
    onHistoryChange: () => void;
    onOpenContextMenu?: (data: ContextMenuState) => void;
}

export const BlockInteraction: React.FC<BlockInteractionProps> = ({ 
    voxelWorld, 
    tool, 
    selectedBlockId, 
    setSelectedBlockId,
    currentLayer,
    showAllLayers,
    rotation,
    historyManager,
    onHistoryChange,
    onOpenContextMenu
}) => {
    const { camera, gl } = useThree();
    const raycaster = useRef(new THREE.Raycaster());
    const ghostRef = useRef<THREE.Group>(null);
    const boxMeshRef = useRef<THREE.Mesh>(null);
    const boxLinesRef = useRef<THREE.LineSegments>(null);
    
    // Interaction Refs
    const highlightPosRef = useRef<THREE.Vector3 | null>(null);
    const dragStartRef = useRef<THREE.Vector3 | null>(null);
    const isDraggingRef = useRef(false);

    // Visual State
    const [highlightPos, setHighlightPos] = useState<THREE.Vector3 | null>(null);
    const [dragStart, setDragStart] = useState<THREE.Vector3 | null>(null);

    // Initialize ghost block materials
    useEffect(() => {
        if (ghostRef.current) {
            // Clear existing
            while(ghostRef.current.children.length > 0){ 
                ghostRef.current.remove(ghostRef.current.children[0]); 
            }

            // Box Mesh
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ 
                color: 0x00ff00, 
                transparent: true, 
                opacity: 0.3,
                depthTest: false
            });
            const mesh = new THREE.Mesh(geometry, material);
            boxMeshRef.current = mesh;
            ghostRef.current.add(mesh);

            // Wireframe
            const edges = new THREE.EdgesGeometry(geometry);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x00ff00, depthTest: false }));
            boxLinesRef.current = line;
            ghostRef.current.add(line);
        }
    }, []);

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (tool === 'move') {
                highlightPosRef.current = null;
                setHighlightPos(null);
                return;
            }

            const rect = gl.domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera);
            
            const intersects = raycaster.current.intersectObjects(voxelWorld.group.children);
            let target: THREE.Vector3 | null = null;
            let validIntersect: THREE.Intersection | null = null;

            if (intersects.length > 0) {
                validIntersect = intersects[0];
            }

            if (validIntersect && validIntersect.face) {
                const intersect = validIntersect;
                const normal = intersect.face.normal.clone()
                    .transformDirection(intersect.object.matrixWorld)
                    .normalize();
                
                normal.x = Math.round(normal.x);
                normal.y = Math.round(normal.y);
                normal.z = Math.round(normal.z);

                if (tool === 'place' || tool === 'fill') {
                    target = intersect.point.clone().addScaledVector(normal, 0.5).floor();
                } else {
                    target = intersect.point.clone().addScaledVector(normal, -0.5).floor();
                }
            } else {
                if (tool === 'place' || tool === 'fill') {
                    const planeHeight = showAllLayers ? 0 : currentLayer;
                    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeHeight);
                    const hitPoint = new THREE.Vector3();
                    const hit = raycaster.current.ray.intersectPlane(plane, hitPoint);
                    if (hit) {
                        const px = Math.floor(hitPoint.x);
                        const pz = Math.floor(hitPoint.z);
                        target = new THREE.Vector3(px, planeHeight, pz);
                    }
                }
            }

            if (!showAllLayers && target && target.y > currentLayer) {
                target = null;
            }

            highlightPosRef.current = target;

            setHighlightPos(prev => {
                if ((prev === null && target === null) || (prev && target && prev.equals(target))) {
                    return prev;
                }
                return target;
            });
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (tool === 'move') return;
            // Allow Alt+Right Click for context menu
            if (e.altKey && e.button === 2 && onOpenContextMenu) {
                e.preventDefault();
                // Raycast to find block
                const rect = gl.domElement.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera);
                const intersects = raycaster.current.intersectObjects(voxelWorld.group.children);
                if (intersects.length > 0) {
                    const intersect = intersects[0];
                    if (intersect.face) {
                        const normal = intersect.face.normal.clone().transformDirection(intersect.object.matrixWorld).normalize();
                        const target = intersect.point.clone().addScaledVector(normal, -0.5).floor();
                        const blockId = voxelWorld.getBlock(target.x, target.y, target.z);
                        if (blockId !== 0) {
                            onOpenContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                blockId,
                                wx: target.x, wy: target.y, wz: target.z
                            });
                        }
                    }
                }
                return;
            }

            if (e.button !== 0 && e.button !== 2) return;
            
            const pos = highlightPosRef.current;
            if (!pos) return;

            if (e.button === 0) {
                if (tool === 'place') {
                    const prevId = voxelWorld.getBlock(pos.x, pos.y, pos.z);
                    const prevRot = voxelWorld.getBlockRotation(pos.x, pos.y, pos.z);
                    voxelWorld.placeBlock(pos.x, pos.y, pos.z, selectedBlockId, rotation);
                    historyManager.push([{
                        x: pos.x, y: pos.y, z: pos.z,
                        prevId, prevRot,
                        newId: selectedBlockId, newRot: rotation
                    }]);
                    onHistoryChange();
                } else if (tool === 'remove') {
                    const prevId = voxelWorld.getBlock(pos.x, pos.y, pos.z);
                    const prevRot = voxelWorld.getBlockRotation(pos.x, pos.y, pos.z);
                    voxelWorld.removeBlock(pos.x, pos.y, pos.z);
                    historyManager.push([{
                        x: pos.x, y: pos.y, z: pos.z,
                        prevId, prevRot,
                        newId: 0, newRot: 0
                    }]);
                    onHistoryChange();
                } else if (tool === 'eyedropper') {
                    const blockId = voxelWorld.getBlock(pos.x, pos.y, pos.z);
                    if (blockId !== 0) setSelectedBlockId(blockId);
                } else if (tool === 'fill') {
                    dragStartRef.current = pos.clone();
                    isDraggingRef.current = true;
                    setDragStart(pos.clone());
                }
            }

            if (e.button === 2 && !e.altKey) {
                const rect = gl.domElement.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.current.setFromCamera(new THREE.Vector2(x, y), camera);
                const intersects = raycaster.current.intersectObjects(voxelWorld.group.children);
                
                if (intersects.length > 0) {
                    const intersect = intersects[0];
                    if (intersect.face) {
                        const normal = intersect.face.normal.clone().transformDirection(intersect.object.matrixWorld).normalize();
                        const target = intersect.point.clone().addScaledVector(normal, -0.5).floor();
                        const prevId = voxelWorld.getBlock(target.x, target.y, target.z);
                        const prevRot = voxelWorld.getBlockRotation(target.x, target.y, target.z);
                        voxelWorld.removeBlock(target.x, target.y, target.z);
                        historyManager.push([{
                            x: target.x, y: target.y, z: target.z,
                            prevId, prevRot,
                            newId: 0, newRot: 0
                        }]);
                        onHistoryChange();
                    }
                }
            }
        };

        const handlePointerUp = (e: PointerEvent) => {
            if (tool === 'fill' && isDraggingRef.current && dragStartRef.current && highlightPosRef.current) {
                const start = dragStartRef.current;
                const end = highlightPosRef.current;
                const minX = Math.min(start.x, end.x);
                const maxX = Math.max(start.x, end.x);
                const minY = Math.min(start.y, end.y);
                const maxY = Math.max(start.y, end.y);
                const minZ = Math.min(start.z, end.z);
                const maxZ = Math.max(start.z, end.z);

                const batch: BlockChange[] = [];
                
                voxelWorld.beginBatch();
                for (let x = minX; x <= maxX; x++) {
                    for (let y = minY; y <= maxY; y++) {
                        for (let z = minZ; z <= maxZ; z++) {
                            const prevId = voxelWorld.getBlock(x, y, z);
                            const prevRot = voxelWorld.getBlockRotation(x, y, z);
                            if (prevId !== selectedBlockId || prevRot !== rotation) {
                                voxelWorld.placeBlock(x, y, z, selectedBlockId, rotation);
                                batch.push({ x, y, z, prevId, prevRot, newId: selectedBlockId, newRot: rotation });
                            }
                        }
                    }
                }
                voxelWorld.endBatch();
                
                if (batch.length > 0) {
                    historyManager.push(batch);
                    onHistoryChange();
                }
            }
            
            isDraggingRef.current = false;
            dragStartRef.current = null;
            setDragStart(null);
        };

        const handleContextMenu = (e: Event) => e.preventDefault();

        const canvas = gl.domElement;
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('pointerup', handlePointerUp); 
        canvas.addEventListener('contextmenu', handleContextMenu);

        return () => {
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [gl, camera, voxelWorld, tool, selectedBlockId, setSelectedBlockId, showAllLayers, currentLayer, rotation, historyManager]);

    // Update Ghost Mesh
    useFrame(() => {
        if (!ghostRef.current || !boxMeshRef.current || !boxLinesRef.current) return;
        const pos = highlightPos;
        const start = dragStart;

        if (pos && tool !== 'move') {
            ghostRef.current.visible = true;
            ghostRef.current.rotation.y = rotation * (-Math.PI / 2);

            if (tool === 'fill' && start) {
                const minX = Math.min(start.x, pos.x);
                const maxX = Math.max(start.x, pos.x);
                const minY = Math.min(start.y, pos.y);
                const maxY = Math.max(start.y, pos.y);
                const minZ = Math.min(start.z, pos.z);
                const maxZ = Math.max(start.z, pos.z);
                const sizeX = maxX - minX + 1;
                const sizeY = maxY - minY + 1;
                const sizeZ = maxZ - minZ + 1;
                const centerX = minX + sizeX / 2;
                const centerY = minY + sizeY / 2;
                const centerZ = minZ + sizeZ / 2;

                ghostRef.current.position.set(centerX, centerY, centerZ);
                ghostRef.current.rotation.y = 0;
                ghostRef.current.scale.set(sizeX, sizeY, sizeZ);
                
                (boxMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x3b82f6);
                (boxLinesRef.current.material as THREE.LineBasicMaterial).color.setHex(0x3b82f6);
            } else {
                ghostRef.current.position.set(pos.x + 0.5, pos.y + 0.5, pos.z + 0.5);
                ghostRef.current.scale.set(1, 1, 1);
                const color = tool === 'remove' ? 0xff0000 : (tool === 'select' ? 0xffff00 : 0x00ff00);
                (boxMeshRef.current.material as THREE.MeshBasicMaterial).color.setHex(color);
                (boxLinesRef.current.material as THREE.LineBasicMaterial).color.setHex(color);
            }
        } else {
            ghostRef.current.visible = false;
        }
    });

    return <group ref={ghostRef} />;
};
