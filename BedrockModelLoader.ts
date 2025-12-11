/**
 * BedrockModelLoader.ts
 * Translates Minecraft Bedrock Edition .geo.json files to the app's EntityModel format
 *
 * Key conversions:
 * - Bedrock uses 16 units = 1 block, we use blocks directly
 * - Bedrock origin is lower corner, we need center positioning
 * - Flip Z axis for coordinate system compatibility
 * - Handle both box UV and per-face UV modes
 * - Convert bone hierarchy to flat parts list with applied transforms
 */

import { EntityModel, ModelPart } from './EntityModels';

// ============================================================================
// Bedrock Format Type Definitions
// ============================================================================

export interface BedrockGeometry {
    format_version: string;
    'minecraft:geometry': BedrockGeometryDef[];
}

export interface BedrockGeometryDef {
    description: {
        identifier: string;
        texture_width: number;
        texture_height: number;
        visible_bounds_width?: number;
        visible_bounds_height?: number;
        visible_bounds_offset?: [number, number, number];
    };
    bones: BedrockBone[];
}

export interface BedrockBone {
    name: string;
    parent?: string;
    pivot?: [number, number, number];
    rotation?: [number, number, number];
    mirror?: boolean;
    inflate?: number;
    cubes?: BedrockCube[];
    // Additional properties we may ignore
    debug?: boolean;
    render_group_id?: number;
    binding?: string;
    locators?: Record<string, any>;
}

export interface BedrockCube {
    origin: [number, number, number];
    size: [number, number, number];
    uv: [number, number] | BedrockPerFaceUV;
    pivot?: [number, number, number];
    rotation?: [number, number, number];
    mirror?: boolean;
    inflate?: number;
}

export interface BedrockPerFaceUV {
    north?: { uv: [number, number]; uv_size?: [number, number]; material_instance?: string };
    south?: { uv: [number, number]; uv_size?: [number, number]; material_instance?: string };
    east?: { uv: [number, number]; uv_size?: [number, number]; material_instance?: string };
    west?: { uv: [number, number]; uv_size?: [number, number]; material_instance?: string };
    up?: { uv: [number, number]; uv_size?: [number, number]; material_instance?: string };
    down?: { uv: [number, number]; uv_size?: [number, number]; material_instance?: string };
}

// ============================================================================
// Internal Structures
// ============================================================================

interface BoneTransform {
    position: [number, number, number];
    rotation: [number, number, number];
    mirror: boolean;
    inflate: number;
}

interface BoneHierarchy {
    bone: BedrockBone;
    transform: BoneTransform;
    worldTransform: BoneTransform;
}

// ============================================================================
// Coordinate System Conversion Utilities
// ============================================================================

/**
 * Convert Bedrock model space coordinates to our block-based coordinates
 * - Bedrock uses 16 units = 1 block
 * - Flip Z axis (Bedrock faces north = -Z, we use standard coordinates)
 */
function bedrockToBlocks(coord: [number, number, number]): [number, number, number] {
    const [x, y, z] = coord;
    return [
        x / 16,
        y / 16,
        -z / 16  // Flip Z axis
    ];
}

/**
 * Convert degrees to radians (for rotation values)
 */
function degToRad(degrees: number): number {
    return degrees * Math.PI / 180;
}

/**
 * Apply rotation transformation to a position vector
 * Bedrock uses X-then-Y-then-Z Euler rotation order
 */
function rotatePoint(
    point: [number, number, number],
    rotation: [number, number, number],
    pivot: [number, number, number]
): [number, number, number] {
    // Translate to pivot
    let [x, y, z] = [
        point[0] - pivot[0],
        point[1] - pivot[1],
        point[2] - pivot[2]
    ];

    const [rx, ry, rz] = rotation.map(degToRad);

    // Rotate around X axis
    if (rx !== 0) {
        const cos = Math.cos(rx);
        const sin = Math.sin(rx);
        const y2 = y * cos - z * sin;
        const z2 = y * sin + z * cos;
        y = y2;
        z = z2;
    }

    // Rotate around Y axis
    if (ry !== 0) {
        const cos = Math.cos(ry);
        const sin = Math.sin(ry);
        const x2 = x * cos + z * sin;
        const z2 = -x * sin + z * cos;
        x = x2;
        z = z2;
    }

    // Rotate around Z axis
    if (rz !== 0) {
        const cos = Math.cos(rz);
        const sin = Math.sin(rz);
        const x2 = x * cos - y * sin;
        const y2 = x * sin + y * cos;
        x = x2;
        y = y2;
    }

    // Translate back from pivot
    return [
        x + pivot[0],
        y + pivot[1],
        z + pivot[2]
    ];
}

/**
 * Combine two rotation vectors (in degrees)
 * Applies parent rotation then child rotation
 */
function combineRotations(
    parent: [number, number, number],
    child: [number, number, number]
): [number, number, number] {
    // Simple additive approach (works for most cases)
    // For more complex cases, would need quaternion math
    return [
        parent[0] + child[0],
        parent[1] + child[1],
        parent[2] + child[2]
    ];
}

// ============================================================================
// UV Mapping Utilities
// ============================================================================

/**
 * Get UV coordinates for box UV mode
 * Bedrock box UV specifies the top-left corner of the unwrapped box layout
 * EntityRenderer.createBoxGeometry handles the per-face UV calculation,
 * so we just return the base UV coordinates directly
 */
function getBoxUV(baseUV: [number, number]): [number, number] {
    // Return raw UV - EntityRenderer handles the box layout calculation
    return baseUV;
}

/**
 * Extract UV from per-face UV object
 * Defaults to north face if per-face data is incomplete
 */
function extractPerFaceUV(perFaceUV: BedrockPerFaceUV): [number, number] {
    // Prefer north face (front)
    if (perFaceUV.north) {
        return perFaceUV.north.uv;
    }
    // Fall back to any available face
    if (perFaceUV.south) return perFaceUV.south.uv;
    if (perFaceUV.east) return perFaceUV.east.uv;
    if (perFaceUV.west) return perFaceUV.west.uv;
    if (perFaceUV.up) return perFaceUV.up.uv;
    if (perFaceUV.down) return perFaceUV.down.uv;

    // Default fallback
    return [0, 0];
}

/**
 * Convert Bedrock per-face UV to our PerFaceUV format
 */
function convertPerFaceUV(bedrockUV: BedrockPerFaceUV): import('./EntityModels').PerFaceUV {
    const result: import('./EntityModels').PerFaceUV = {};

    if (bedrockUV.north) {
        result.north = {
            uv: bedrockUV.north.uv,
            uv_size: bedrockUV.north.uv_size || [0, 0]
        };
    }
    if (bedrockUV.south) {
        result.south = {
            uv: bedrockUV.south.uv,
            uv_size: bedrockUV.south.uv_size || [0, 0]
        };
    }
    if (bedrockUV.east) {
        result.east = {
            uv: bedrockUV.east.uv,
            uv_size: bedrockUV.east.uv_size || [0, 0]
        };
    }
    if (bedrockUV.west) {
        result.west = {
            uv: bedrockUV.west.uv,
            uv_size: bedrockUV.west.uv_size || [0, 0]
        };
    }
    if (bedrockUV.up) {
        result.up = {
            uv: bedrockUV.up.uv,
            uv_size: bedrockUV.up.uv_size || [0, 0]
        };
    }
    if (bedrockUV.down) {
        result.down = {
            uv: bedrockUV.down.uv,
            uv_size: bedrockUV.down.uv_size || [0, 0]
        };
    }

    return result;
}

/**
 * Get UV coordinates from cube, handling both box UV and per-face UV
 */
function getCubeUV(cube: BedrockCube): [number, number] {
    if (!cube.uv) {
        return [0, 0];
    }

    if (Array.isArray(cube.uv)) {
        // Box UV mode - return raw coordinates
        return getBoxUV(cube.uv);
    } else {
        // Per-face UV mode - extract north face as fallback for box UV
        return extractPerFaceUV(cube.uv);
    }
}

/**
 * Check if cube uses per-face UV mode
 */
function hasPerFaceUV(cube: BedrockCube): boolean {
    return cube.uv !== undefined && !Array.isArray(cube.uv);
}

// ============================================================================
// Bone Hierarchy Processing
// ============================================================================

/**
 * Build a map of bones with their local transforms
 */
function buildBoneMap(bones: BedrockBone[]): Map<string, BoneHierarchy> {
    const boneMap = new Map<string, BoneHierarchy>();

    for (const bone of bones) {
        const transform: BoneTransform = {
            position: bone.pivot || [0, 0, 0],
            rotation: bone.rotation || [0, 0, 0],
            mirror: bone.mirror || false,
            inflate: bone.inflate || 0
        };

        boneMap.set(bone.name, {
            bone,
            transform,
            worldTransform: { ...transform } // Will be computed later
        });
    }

    return boneMap;
}

/**
 * Calculate world transforms for all bones by traversing the hierarchy
 */
function calculateWorldTransforms(boneMap: Map<string, BoneHierarchy>): void {
    // Helper to compute world transform recursively
    function computeWorldTransform(boneName: string, visited: Set<string>): BoneTransform {
        if (visited.has(boneName)) {
            throw new Error(`Circular dependency detected in bone hierarchy: ${boneName}`);
        }
        visited.add(boneName);

        const boneHierarchy = boneMap.get(boneName);
        if (!boneHierarchy) {
            throw new Error(`Bone not found: ${boneName}`);
        }

        const bone = boneHierarchy.bone;
        const localTransform = boneHierarchy.transform;

        // If no parent, world transform = local transform
        if (!bone.parent) {
            boneHierarchy.worldTransform = { ...localTransform };
            return boneHierarchy.worldTransform;
        }

        // Get parent's world transform (compute recursively if needed)
        const parentHierarchy = boneMap.get(bone.parent);
        if (!parentHierarchy) {
            console.warn(`Parent bone not found: ${bone.parent}, treating as root`);
            boneHierarchy.worldTransform = { ...localTransform };
            return boneHierarchy.worldTransform;
        }

        const parentWorld = computeWorldTransform(bone.parent, visited);

        // Transform child's pivot point from parent space to world space
        // The child's pivot is already in world coordinates, but we need to account
        // for parent rotation if the parent has rotation applied
        let worldPosition: [number, number, number];

        if (parentWorld.rotation[0] === 0 && parentWorld.rotation[1] === 0 && parentWorld.rotation[2] === 0) {
            // No parent rotation, position stays as-is
            worldPosition = [...localTransform.position];
        } else {
            // Apply parent's rotation around parent's pivot
            worldPosition = rotatePoint(
                localTransform.position,
                parentWorld.rotation,
                parentWorld.position
            );
        }

        // Combine rotations
        const worldRotation = combineRotations(
            parentWorld.rotation,
            localTransform.rotation
        );

        // Inherit mirror and inflate
        const worldMirror = parentWorld.mirror !== localTransform.mirror; // XOR logic
        const worldInflate = parentWorld.inflate + localTransform.inflate;

        boneHierarchy.worldTransform = {
            position: worldPosition,
            rotation: worldRotation,
            mirror: worldMirror,
            inflate: worldInflate
        };

        return boneHierarchy.worldTransform;
    }

    // Compute world transform for all bones
    for (const boneName of boneMap.keys()) {
        computeWorldTransform(boneName, new Set());
    }
}

// ============================================================================
// Cube to ModelPart Conversion
// ============================================================================

/**
 * Convert a Bedrock cube to our ModelPart format
 */
function convertCube(
    cube: BedrockCube,
    boneName: string,
    boneTransform: BoneTransform
): ModelPart {
    const size = cube.size;
    const origin = cube.origin;
    const inflate = cube.inflate !== undefined ? cube.inflate : boneTransform.inflate;
    const mirror = cube.mirror !== undefined ? cube.mirror : boneTransform.mirror;

    // Apply inflation to size
    const inflatedSize: [number, number, number] = [
        size[0] + inflate * 2,
        size[1] + inflate * 2,
        size[2] + inflate * 2
    ];

    // Calculate center position of the cube
    // Bedrock origin is the lower corner, we need the center
    const centerInBedrock: [number, number, number] = [
        origin[0] + size[0] / 2,
        origin[1] + size[1] / 2,
        origin[2] + size[2] / 2
    ];

    // In Bedrock models, cube origins are in world space, not bone-local space
    // Only apply cube-specific rotation if specified
    const cubeRotation = cube.rotation || [0, 0, 0];
    const cubePivot = cube.pivot || boneTransform.position;

    let finalPosition = centerInBedrock;
    if (cubeRotation[0] !== 0 || cubeRotation[1] !== 0 || cubeRotation[2] !== 0) {
        finalPosition = rotatePoint(centerInBedrock, cubeRotation, cubePivot);
    }

    // NOTE: We do NOT apply bone transform rotation here for static display
    // Bone transforms are used for animation, but cube positions are already in world space

    // Convert to our coordinate system
    const blockPosition = bedrockToBlocks(finalPosition);
    const blockSize = bedrockToBlocks(inflatedSize);

    // Get UV coordinates
    const uv = getCubeUV(cube);

    // Create ModelPart
    const part: ModelPart = {
        name: `${boneName}_cube`,
        origin: blockPosition,
        size: inflatedSize, // Keep in pixels as per EntityModel interface
        uv: uv,
        mirror: mirror
    };

    // Add per-face UV data if present
    if (hasPerFaceUV(cube) && !Array.isArray(cube.uv)) {
        part.perFaceUV = convertPerFaceUV(cube.uv as BedrockPerFaceUV);
    }

    // Only add rotation if cube itself has rotation
    if (cubeRotation[0] !== 0 || cubeRotation[1] !== 0 || cubeRotation[2] !== 0) {
        part.rotation = cubeRotation;
        part.pivot = bedrockToBlocks(cubePivot);
    }

    return part;
}

// ============================================================================
// Main Translation Function
// ============================================================================

/**
 * Normalized geometry data structure for internal processing
 */
interface NormalizedGeometry {
    identifier: string;
    textureWidth: number;
    textureHeight: number;
    bones: BedrockBone[];
}

/**
 * Parse geometry from JSON, handling both 1.8.0 and 1.12.0+ formats
 */
function parseGeometryFromJson(json: any): NormalizedGeometry {
    // Check for new format (1.12.0+): minecraft:geometry array
    if (json['minecraft:geometry'] && Array.isArray(json['minecraft:geometry'])) {
        const geoDef = json['minecraft:geometry'][0];
        if (!geoDef || !geoDef.description) {
            throw new Error('Invalid minecraft:geometry format');
        }
        return {
            identifier: geoDef.description.identifier || 'unknown',
            textureWidth: geoDef.description.texture_width || 64,
            textureHeight: geoDef.description.texture_height || 64,
            bones: geoDef.bones || []
        };
    }

    // Check for old format (1.8.0): geometry.name.version object
    const geoKeys = Object.keys(json).filter(key => key.startsWith('geometry.'));
    if (geoKeys.length > 0) {
        const geoKey = geoKeys[0];
        const geoDef = json[geoKey];
        if (!geoDef) {
            throw new Error('Invalid geometry.* format');
        }
        return {
            identifier: geoKey, // e.g., "geometry.zombie.v1.8"
            textureWidth: geoDef.texturewidth || geoDef.texture_width || 64,
            textureHeight: geoDef.textureheight || geoDef.texture_height || 64,
            bones: geoDef.bones || []
        };
    }

    throw new Error('Unrecognized Bedrock model format');
}

/**
 * Translate a Bedrock geometry JSON to our EntityModel format
 */
export function translateBedrockModel(json: any): EntityModel {
    // Parse the geometry into normalized format
    const geometry = parseGeometryFromJson(json);

    console.log(`[BedrockModelLoader] Translating model: ${geometry.identifier}, texture: ${geometry.textureWidth}x${geometry.textureHeight}, bones: ${geometry.bones.length}`);

    if (!geometry.bones || geometry.bones.length === 0) {
        throw new Error('No bones found in Bedrock model');
    }

    // Filter out bones with neverRender: true
    const renderableBones = geometry.bones.filter((bone: any) => !bone.neverRender);
    console.log(`[BedrockModelLoader] Renderable bones: ${renderableBones.length}`);

    // Build bone hierarchy
    const boneMap = buildBoneMap(renderableBones);
    calculateWorldTransforms(boneMap);

    // Convert all cubes to ModelParts
    const parts: ModelPart[] = [];
    let cubeCounter = 0;

    for (const [boneName, boneHierarchy] of boneMap) {
        const bone = boneHierarchy.bone;
        const worldTransform = boneHierarchy.worldTransform;

        if (!bone.cubes || bone.cubes.length === 0) {
            continue;
        }

        for (const cube of bone.cubes) {
            const part = convertCube(cube, boneName, worldTransform);

            // Make part names unique
            if (bone.cubes.length > 1) {
                part.name = `${boneName}_cube_${cubeCounter++}`;
            } else {
                part.name = boneName;
            }

            parts.push(part);
        }
    }

    // Extract entity name from identifier
    // Format: "geometry.entity_name" or "geometry.entity_name.variant"
    const identifier = geometry.identifier;
    const entityName = identifier.replace(/^geometry\./, '').split('.')[0];

    console.log(`[BedrockModelLoader] Created ${parts.length} parts for ${entityName}`);
    if (parts.length > 0) {
        console.log(`[BedrockModelLoader] First part: ${parts[0].name}, origin: [${parts[0].origin.join(', ')}], size: [${parts[0].size.join(', ')}]`);
    }

    // Create EntityModel
    const model: EntityModel = {
        name: entityName,
        textureWidth: geometry.textureWidth,
        textureHeight: geometry.textureHeight,
        parts: parts,
        scale: 1.0 // Default scale
    };

    return model;
}

// ============================================================================
// File Loading Functions
// ============================================================================

/**
 * Cache for loaded models
 * NOTE: Cache is cleared on each page load in development
 */
const modelCache = new Map<string, EntityModel>();

// Clear cache on hot reload in development
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        modelCache.clear();
        console.log('[BedrockModelLoader] Cache cleared on HMR');
    });
}

/**
 * Load and translate a Bedrock model from a JSON file
 */
export async function loadBedrockModel(jsonPath: string): Promise<EntityModel> {
    // Check cache first
    if (modelCache.has(jsonPath)) {
        return modelCache.get(jsonPath)!;
    }

    try {
        // Fetch the JSON file
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${jsonPath}: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();

        // Translate to our format (handles both 1.8.0 and 1.12.0+ formats)
        const model = translateBedrockModel(json);

        // Cache the result
        modelCache.set(jsonPath, model);

        return model;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to load Bedrock model from ${jsonPath}: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Load a Bedrock entity model by entity name
 * Assumes models are stored in a standard path structure
 */
export async function getBedrockEntityModel(
    entityName: string,
    basePath: string = '/models/entity'
): Promise<EntityModel> {
    // Convert entity name to file path
    // e.g., "zombie" -> "/models/entity/zombie.geo.json"
    const fileName = `${entityName.toLowerCase()}.geo.json`;
    const fullPath = `${basePath}/${fileName}`;

    return loadBedrockModel(fullPath);
}

/**
 * Clear the model cache (useful for development/testing)
 */
export function clearModelCache(): void {
    modelCache.clear();
}

/**
 * Pre-load multiple models into the cache
 */
export async function preloadBedrockModels(modelPaths: string[]): Promise<void> {
    const promises = modelPaths.map(path => loadBedrockModel(path));
    await Promise.all(promises);
}

// ============================================================================
// Error Handling and Validation
// ============================================================================

/**
 * Validate a Bedrock geometry object
 * Returns null if valid, otherwise returns an error message
 */
export function validateBedrockGeometry(geometry: any): string | null {
    if (!geometry) {
        return 'Geometry object is null or undefined';
    }

    if (typeof geometry !== 'object') {
        return 'Geometry must be an object';
    }

    if (!geometry['minecraft:geometry']) {
        return "Missing 'minecraft:geometry' property";
    }

    if (!Array.isArray(geometry['minecraft:geometry'])) {
        return "'minecraft:geometry' must be an array";
    }

    if (geometry['minecraft:geometry'].length === 0) {
        return "'minecraft:geometry' array is empty";
    }

    const geoDef = geometry['minecraft:geometry'][0];

    if (!geoDef.description) {
        return 'Missing description object in geometry definition';
    }

    if (!geoDef.description.identifier) {
        return 'Missing identifier in description';
    }

    if (!geoDef.bones || !Array.isArray(geoDef.bones)) {
        return 'Missing or invalid bones array';
    }

    // Validate bone structure
    for (let i = 0; i < geoDef.bones.length; i++) {
        const bone = geoDef.bones[i];
        if (!bone.name) {
            return `Bone at index ${i} is missing a name`;
        }

        // Check for circular dependencies
        const visited = new Set<string>();
        let current = bone;
        while (current.parent) {
            if (visited.has(current.parent)) {
                return `Circular parent dependency detected: ${current.parent}`;
            }
            visited.add(current.parent);
            current = geoDef.bones.find((b: BedrockBone) => b.name === current.parent);
            if (!current) {
                // Parent not found - will be handled with a warning, not an error
                break;
            }
        }
    }

    return null;
}

// ============================================================================
// Exports
// ============================================================================

export default {
    translateBedrockModel,
    loadBedrockModel,
    getBedrockEntityModel,
    clearModelCache,
    preloadBedrockModels,
    validateBedrockGeometry
};
