// Entity model definitions matching Minecraft's actual entity models
// All dimensions are in pixels (1 block = 16 pixels)

import { loadBedrockModel } from './BedrockModelLoader';

export interface PerFaceUV {
    north?: { uv: [number, number]; uv_size: [number, number] };
    south?: { uv: [number, number]; uv_size: [number, number] };
    east?: { uv: [number, number]; uv_size: [number, number] };
    west?: { uv: [number, number]; uv_size: [number, number] };
    up?: { uv: [number, number]; uv_size: [number, number] };
    down?: { uv: [number, number]; uv_size: [number, number] };
}

export interface ModelPart {
    name: string;
    // Position offset from entity origin (in blocks)
    origin: [number, number, number];
    // Size in pixels
    size: [number, number, number];
    // UV coordinates on texture (top-left corner) - used for box UV mode
    uv: [number, number];
    // Per-face UV mapping (overrides box UV mode if present)
    perFaceUV?: PerFaceUV;
    // Optional rotation pivot and angles
    pivot?: [number, number, number];
    rotation?: [number, number, number];
    // Mirror texture horizontally
    mirror?: boolean;
}

export interface EntityModel {
    name: string;
    // Texture dimensions
    textureWidth: number;
    textureHeight: number;
    // Model parts
    parts: ModelPart[];
    // Scale factor (1 = normal size)
    scale: number;
}

// Humanoid model (Zombie, Skeleton, Player-like)
export const HUMANOID_MODEL: EntityModel = {
    name: 'humanoid',
    textureWidth: 64,
    textureHeight: 64,
    scale: 1,
    parts: [
        // Head
        {
            name: 'head',
            origin: [0, 1.5, 0],
            size: [8, 8, 8],
            uv: [0, 0],
        },
        // Body
        {
            name: 'body',
            origin: [0, 0.75, 0],
            size: [8, 12, 4],
            uv: [16, 16],
        },
        // Right Arm
        {
            name: 'right_arm',
            origin: [-0.375, 0.75, 0],
            size: [4, 12, 4],
            uv: [40, 16],
        },
        // Left Arm
        {
            name: 'left_arm',
            origin: [0.375, 0.75, 0],
            size: [4, 12, 4],
            uv: [32, 48],
            mirror: true,
        },
        // Right Leg
        {
            name: 'right_leg',
            origin: [-0.125, 0, 0],
            size: [4, 12, 4],
            uv: [0, 16],
        },
        // Left Leg
        {
            name: 'left_leg',
            origin: [0.125, 0, 0],
            size: [4, 12, 4],
            uv: [16, 48],
            mirror: true,
        },
    ],
};

// Quadruped model (Pig, Cow, Sheep, etc.)
export const QUADRUPED_MODEL: EntityModel = {
    name: 'quadruped',
    textureWidth: 64,
    textureHeight: 32,
    scale: 0.9,
    parts: [
        // Head
        {
            name: 'head',
            origin: [0, 0.75, -0.5],
            size: [8, 8, 8],
            uv: [0, 0],
        },
        // Body
        {
            name: 'body',
            origin: [0, 0.6875, 0],
            size: [8, 16, 10],
            uv: [28, 8],
            rotation: [90, 0, 0],
        },
        // Front Right Leg
        {
            name: 'front_right_leg',
            origin: [-0.25, 0, -0.375],
            size: [4, 12, 4],
            uv: [0, 16],
        },
        // Front Left Leg
        {
            name: 'front_left_leg',
            origin: [0.25, 0, -0.375],
            size: [4, 12, 4],
            uv: [0, 16],
            mirror: true,
        },
        // Back Right Leg
        {
            name: 'back_right_leg',
            origin: [-0.25, 0, 0.4375],
            size: [4, 12, 4],
            uv: [0, 16],
        },
        // Back Left Leg
        {
            name: 'back_left_leg',
            origin: [0.25, 0, 0.4375],
            size: [4, 12, 4],
            uv: [0, 16],
            mirror: true,
        },
    ],
};

// Chicken model
export const CHICKEN_MODEL: EntityModel = {
    name: 'chicken',
    textureWidth: 64,
    textureHeight: 32,
    scale: 0.6,
    parts: [
        // Head
        {
            name: 'head',
            origin: [0, 0.5625, -0.25],
            size: [4, 6, 3],
            uv: [0, 0],
        },
        // Beak
        {
            name: 'beak',
            origin: [0, 0.5, -0.375],
            size: [4, 2, 2],
            uv: [14, 0],
        },
        // Body
        {
            name: 'body',
            origin: [0, 0.375, 0],
            size: [6, 8, 6],
            uv: [0, 9],
        },
        // Right Leg
        {
            name: 'right_leg',
            origin: [-0.0625, 0, 0],
            size: [3, 5, 3],
            uv: [26, 0],
        },
        // Left Leg
        {
            name: 'left_leg',
            origin: [0.0625, 0, 0],
            size: [3, 5, 3],
            uv: [26, 0],
            mirror: true,
        },
        // Right Wing
        {
            name: 'right_wing',
            origin: [-0.25, 0.375, 0],
            size: [1, 4, 6],
            uv: [24, 13],
        },
        // Left Wing
        {
            name: 'left_wing',
            origin: [0.25, 0.375, 0],
            size: [1, 4, 6],
            uv: [24, 13],
            mirror: true,
        },
    ],
};

// Creeper model
export const CREEPER_MODEL: EntityModel = {
    name: 'creeper',
    textureWidth: 64,
    textureHeight: 32,
    scale: 1,
    parts: [
        // Head
        {
            name: 'head',
            origin: [0, 1.125, 0],
            size: [8, 8, 8],
            uv: [0, 0],
        },
        // Body
        {
            name: 'body',
            origin: [0, 0.5, 0],
            size: [4, 12, 8],
            uv: [16, 16],
        },
        // Front Right Leg
        {
            name: 'front_right_leg',
            origin: [-0.125, 0, -0.25],
            size: [4, 6, 4],
            uv: [0, 16],
        },
        // Front Left Leg
        {
            name: 'front_left_leg',
            origin: [0.125, 0, -0.25],
            size: [4, 6, 4],
            uv: [0, 16],
            mirror: true,
        },
        // Back Right Leg
        {
            name: 'back_right_leg',
            origin: [-0.125, 0, 0.25],
            size: [4, 6, 4],
            uv: [0, 16],
        },
        // Back Left Leg
        {
            name: 'back_left_leg',
            origin: [0.125, 0, 0.25],
            size: [4, 6, 4],
            uv: [0, 16],
            mirror: true,
        },
    ],
};

// Spider model
export const SPIDER_MODEL: EntityModel = {
    name: 'spider',
    textureWidth: 64,
    textureHeight: 32,
    scale: 1,
    parts: [
        // Head
        {
            name: 'head',
            origin: [0, 0.5625, -0.6875],
            size: [8, 8, 8],
            uv: [32, 4],
        },
        // Body (thorax)
        {
            name: 'body',
            origin: [0, 0.5625, 0],
            size: [6, 6, 6],
            uv: [0, 0],
        },
        // Abdomen
        {
            name: 'abdomen',
            origin: [0, 0.5625, 0.6875],
            size: [12, 8, 12],
            uv: [0, 12],
        },
        // Legs (simplified - 4 pairs)
        {
            name: 'leg1',
            origin: [-0.6875, 0.375, -0.125],
            size: [16, 2, 2],
            uv: [18, 0],
            rotation: [0, 45, -30],
        },
        {
            name: 'leg2',
            origin: [0.6875, 0.375, -0.125],
            size: [16, 2, 2],
            uv: [18, 0],
            rotation: [0, -45, 30],
            mirror: true,
        },
        {
            name: 'leg3',
            origin: [-0.6875, 0.375, 0.125],
            size: [16, 2, 2],
            uv: [18, 0],
            rotation: [0, -45, -30],
        },
        {
            name: 'leg4',
            origin: [0.6875, 0.375, 0.125],
            size: [16, 2, 2],
            uv: [18, 0],
            rotation: [0, 45, 30],
            mirror: true,
        },
    ],
};

// Slime/Cube model
export const CUBE_MODEL: EntityModel = {
    name: 'cube',
    textureWidth: 64,
    textureHeight: 32,
    scale: 1,
    parts: [
        {
            name: 'body',
            origin: [0, 0.5, 0],
            size: [16, 16, 16],
            uv: [0, 0],
        },
    ],
};

// Ghast model (large floating cube with tentacles)
export const GHAST_MODEL: EntityModel = {
    name: 'ghast',
    textureWidth: 64,
    textureHeight: 32,
    scale: 2,
    parts: [
        // Main body
        {
            name: 'body',
            origin: [0, 1, 0],
            size: [16, 16, 16],
            uv: [0, 0],
        },
    ],
};

// Wolf/Dog model
export const WOLF_MODEL: EntityModel = {
    name: 'wolf',
    textureWidth: 64,
    textureHeight: 32,
    scale: 0.8,
    parts: [
        // Head
        {
            name: 'head',
            origin: [0, 0.625, -0.4375],
            size: [6, 6, 4],
            uv: [0, 0],
        },
        // Snout
        {
            name: 'snout',
            origin: [0, 0.5625, -0.625],
            size: [3, 3, 4],
            uv: [0, 10],
        },
        // Body
        {
            name: 'body',
            origin: [0, 0.5, 0.125],
            size: [6, 14, 8],
            uv: [18, 14],
            rotation: [90, 0, 0],
        },
        // Front Right Leg
        {
            name: 'front_right_leg',
            origin: [-0.125, 0, -0.25],
            size: [2, 8, 2],
            uv: [0, 18],
        },
        // Front Left Leg
        {
            name: 'front_left_leg',
            origin: [0.125, 0, -0.25],
            size: [2, 8, 2],
            uv: [0, 18],
            mirror: true,
        },
        // Back Right Leg
        {
            name: 'back_right_leg',
            origin: [-0.125, 0, 0.4375],
            size: [2, 8, 2],
            uv: [0, 18],
        },
        // Back Left Leg
        {
            name: 'back_left_leg',
            origin: [0.125, 0, 0.4375],
            size: [2, 8, 2],
            uv: [0, 18],
            mirror: true,
        },
        // Tail
        {
            name: 'tail',
            origin: [0, 0.5625, 0.625],
            size: [2, 8, 2],
            uv: [9, 18],
            rotation: [-60, 0, 0],
        },
    ],
};

// Iron Golem model
export const IRON_GOLEM_MODEL: EntityModel = {
    name: 'iron_golem',
    textureWidth: 128,
    textureHeight: 128,
    scale: 1.4,
    parts: [
        // Head
        {
            name: 'head',
            origin: [0, 2.0625, 0],
            size: [8, 10, 8],
            uv: [0, 0],
        },
        // Body
        {
            name: 'body',
            origin: [0, 1.125, 0],
            size: [12, 18, 9],
            uv: [0, 40],
        },
        // Right Arm
        {
            name: 'right_arm',
            origin: [-0.8125, 1.375, 0],
            size: [4, 30, 6],
            uv: [60, 21],
        },
        // Left Arm
        {
            name: 'left_arm',
            origin: [0.8125, 1.375, 0],
            size: [4, 30, 6],
            uv: [60, 58],
        },
        // Right Leg
        {
            name: 'right_leg',
            origin: [-0.25, 0, 0],
            size: [6, 16, 5],
            uv: [37, 0],
        },
        // Left Leg
        {
            name: 'left_leg',
            origin: [0.25, 0, 0],
            size: [6, 16, 5],
            uv: [60, 0],
        },
    ],
};

// Enderman model (tall humanoid)
export const ENDERMAN_MODEL: EntityModel = {
    name: 'enderman',
    textureWidth: 64,
    textureHeight: 32,
    scale: 1.2,
    parts: [
        // Head
        {
            name: 'head',
            origin: [0, 2.625, 0],
            size: [8, 8, 8],
            uv: [0, 0],
        },
        // Body
        {
            name: 'body',
            origin: [0, 1.5, 0],
            size: [8, 12, 4],
            uv: [32, 16],
        },
        // Right Arm
        {
            name: 'right_arm',
            origin: [-0.375, 1.5, 0],
            size: [2, 30, 2],
            uv: [56, 0],
        },
        // Left Arm
        {
            name: 'left_arm',
            origin: [0.375, 1.5, 0],
            size: [2, 30, 2],
            uv: [56, 0],
            mirror: true,
        },
        // Right Leg
        {
            name: 'right_leg',
            origin: [-0.125, 0, 0],
            size: [2, 30, 2],
            uv: [56, 0],
        },
        // Left Leg
        {
            name: 'left_leg',
            origin: [0.125, 0, 0],
            size: [2, 30, 2],
            uv: [56, 0],
            mirror: true,
        },
    ],
};

// Bee model
export const BEE_MODEL: EntityModel = {
    name: 'bee',
    textureWidth: 64,
    textureHeight: 64,
    scale: 0.5,
    parts: [
        // Body
        {
            name: 'body',
            origin: [0, 0.375, 0],
            size: [7, 7, 10],
            uv: [0, 0],
        },
        // Stinger
        {
            name: 'stinger',
            origin: [0, 0.375, 0.4375],
            size: [0, 1, 2],
            uv: [26, 7],
        },
        // Left Wing
        {
            name: 'left_wing',
            origin: [0.125, 0.5, -0.0625],
            size: [0, 4, 6],
            uv: [0, 18],
        },
        // Right Wing
        {
            name: 'right_wing',
            origin: [-0.125, 0.5, -0.0625],
            size: [0, 4, 6],
            uv: [0, 18],
            mirror: true,
        },
        // Front Legs
        {
            name: 'front_legs',
            origin: [0, 0.125, -0.3125],
            size: [3, 2, 0],
            uv: [26, 1],
        },
        // Middle Legs
        {
            name: 'middle_legs',
            origin: [0, 0.125, 0],
            size: [3, 2, 0],
            uv: [26, 3],
        },
        // Back Legs
        {
            name: 'back_legs',
            origin: [0, 0.125, 0.3125],
            size: [3, 2, 0],
            uv: [26, 5],
        },
    ],
};

// Villager model
export const VILLAGER_MODEL: EntityModel = {
    name: 'villager',
    textureWidth: 64,
    textureHeight: 64,
    scale: 1,
    parts: [
        // Head
        {
            name: 'head',
            origin: [0, 1.5, 0],
            size: [8, 10, 8],
            uv: [0, 0],
        },
        // Nose
        {
            name: 'nose',
            origin: [0, 1.375, -0.375],
            size: [2, 4, 2],
            uv: [24, 0],
        },
        // Body
        {
            name: 'body',
            origin: [0, 0.75, 0],
            size: [8, 12, 6],
            uv: [16, 20],
        },
        // Arms (crossed)
        {
            name: 'arms',
            origin: [0, 0.875, -0.125],
            size: [8, 4, 4],
            uv: [40, 38],
        },
        // Right Leg
        {
            name: 'right_leg',
            origin: [-0.125, 0, 0],
            size: [4, 12, 4],
            uv: [0, 22],
        },
        // Left Leg
        {
            name: 'left_leg',
            origin: [0.125, 0, 0],
            size: [4, 12, 4],
            uv: [0, 22],
            mirror: true,
        },
    ],
};

// Blaze model
export const BLAZE_MODEL: EntityModel = {
    name: 'blaze',
    textureWidth: 64,
    textureHeight: 32,
    scale: 0.9,
    parts: [
        // Head
        {
            name: 'head',
            origin: [0, 1, 0],
            size: [8, 8, 8],
            uv: [0, 0],
        },
        // Rods (simplified as vertical bars)
        {
            name: 'rod1',
            origin: [-0.375, 0.5, -0.375],
            size: [2, 16, 2],
            uv: [0, 16],
        },
        {
            name: 'rod2',
            origin: [0.375, 0.5, -0.375],
            size: [2, 16, 2],
            uv: [0, 16],
        },
        {
            name: 'rod3',
            origin: [-0.375, 0.5, 0.375],
            size: [2, 16, 2],
            uv: [0, 16],
        },
        {
            name: 'rod4',
            origin: [0.375, 0.5, 0.375],
            size: [2, 16, 2],
            uv: [0, 16],
        },
    ],
};

// Ender Dragon model (simplified but recognizable)
export const ENDER_DRAGON_MODEL: EntityModel = {
    name: 'ender_dragon',
    textureWidth: 256,
    textureHeight: 256,
    scale: 2.5,
    parts: [
        // Head
        {
            name: 'head',
            origin: [0, 1.0, -1.5],
            size: [16, 16, 16],
            uv: [176, 44],
        },
        // Jaw
        {
            name: 'jaw',
            origin: [0, 0.75, -1.75],
            size: [12, 4, 16],
            uv: [176, 65],
        },
        // Neck
        {
            name: 'neck',
            origin: [0, 0.875, -0.5],
            size: [10, 10, 18],
            uv: [112, 30],
        },
        // Body
        {
            name: 'body',
            origin: [0, 0.75, 0.75],
            size: [24, 16, 32],
            uv: [0, 0],
        },
        // Left Wing
        {
            name: 'left_wing',
            origin: [1.5, 1.0, 0],
            size: [56, 4, 32],
            uv: [0, 152],
            rotation: [0, 0, -20],
        },
        // Right Wing
        {
            name: 'right_wing',
            origin: [-1.5, 1.0, 0],
            size: [56, 4, 32],
            uv: [0, 152],
            rotation: [0, 0, 20],
            mirror: true,
        },
        // Tail segment 1
        {
            name: 'tail1',
            origin: [0, 0.75, 1.75],
            size: [8, 8, 16],
            uv: [152, 88],
        },
        // Tail segment 2
        {
            name: 'tail2',
            origin: [0, 0.75, 2.75],
            size: [6, 6, 16],
            uv: [180, 88],
        },
        // Tail segment 3
        {
            name: 'tail3',
            origin: [0, 0.75, 3.75],
            size: [4, 4, 16],
            uv: [200, 88],
        },
        // Front Left Leg
        {
            name: 'front_left_leg',
            origin: [0.75, 0, -0.5],
            size: [8, 16, 8],
            uv: [112, 0],
        },
        // Front Right Leg
        {
            name: 'front_right_leg',
            origin: [-0.75, 0, -0.5],
            size: [8, 16, 8],
            uv: [112, 0],
            mirror: true,
        },
        // Back Left Leg
        {
            name: 'back_left_leg',
            origin: [0.75, 0, 1.0],
            size: [8, 16, 8],
            uv: [0, 0],
        },
        // Back Right Leg
        {
            name: 'back_right_leg',
            origin: [-0.75, 0, 1.0],
            size: [8, 16, 8],
            uv: [0, 0],
            mirror: true,
        },
    ],
};

// Wither model
export const WITHER_MODEL: EntityModel = {
    name: 'wither',
    textureWidth: 64,
    textureHeight: 64,
    scale: 1.5,
    parts: [
        // Center Head
        {
            name: 'center_head',
            origin: [0, 1.5, 0],
            size: [8, 8, 8],
            uv: [0, 16],
        },
        // Left Head
        {
            name: 'left_head',
            origin: [0.625, 1.375, 0],
            size: [6, 6, 6],
            uv: [32, 16],
        },
        // Right Head
        {
            name: 'right_head',
            origin: [-0.625, 1.375, 0],
            size: [6, 6, 6],
            uv: [32, 16],
            mirror: true,
        },
        // Body (ribcage)
        {
            name: 'body',
            origin: [0, 0.875, 0],
            size: [12, 12, 4],
            uv: [0, 32],
        },
        // Tail
        {
            name: 'tail',
            origin: [0, 0.25, 0],
            size: [4, 16, 4],
            uv: [16, 48],
        },
    ],
};

// Map entity names to their models
export const ENTITY_MODELS: Record<string, EntityModel> = {
    // Passive
    'Cow': QUADRUPED_MODEL,
    'Pig': QUADRUPED_MODEL,
    'Sheep': QUADRUPED_MODEL,
    'Chicken': CHICKEN_MODEL,
    'Horse': QUADRUPED_MODEL,
    'Wolf': WOLF_MODEL,
    'Cat': WOLF_MODEL,
    'Rabbit': QUADRUPED_MODEL,
    'Fox': WOLF_MODEL,
    'Bee': BEE_MODEL,
    'Axolotl': QUADRUPED_MODEL,
    'Frog': QUADRUPED_MODEL,
    'Sniffer': QUADRUPED_MODEL,
    'Armadillo': QUADRUPED_MODEL,
    'Bat': BEE_MODEL,
    'Parrot': CHICKEN_MODEL,
    'Turtle': QUADRUPED_MODEL,
    'Dolphin': QUADRUPED_MODEL,
    'Squid': CUBE_MODEL,
    'Glow Squid': CUBE_MODEL,
    'Strider': QUADRUPED_MODEL,
    'Allay': BEE_MODEL,
    'Camel': QUADRUPED_MODEL,

    // Hostile
    'Zombie': HUMANOID_MODEL,
    'Skeleton': HUMANOID_MODEL,
    'Creeper': CREEPER_MODEL,
    'Spider': SPIDER_MODEL,
    'Cave Spider': SPIDER_MODEL,
    'Enderman': ENDERMAN_MODEL,
    'Blaze': BLAZE_MODEL,
    'Ghast': GHAST_MODEL,
    'Wither Skeleton': HUMANOID_MODEL,
    'Piglin': HUMANOID_MODEL,
    'Piglin Brute': HUMANOID_MODEL,
    'Hoglin': QUADRUPED_MODEL,
    'Zoglin': QUADRUPED_MODEL,
    'Warden': HUMANOID_MODEL,
    'Slime': CUBE_MODEL,
    'Magma Cube': CUBE_MODEL,
    'Phantom': BEE_MODEL,
    'Drowned': HUMANOID_MODEL,
    'Husk': HUMANOID_MODEL,
    'Stray': HUMANOID_MODEL,
    'Witch': VILLAGER_MODEL,
    'Vindicator': HUMANOID_MODEL,
    'Evoker': HUMANOID_MODEL,
    'Pillager': HUMANOID_MODEL,
    'Ravager': QUADRUPED_MODEL,
    'Guardian': CUBE_MODEL,
    'Elder Guardian': CUBE_MODEL,
    'Shulker': CUBE_MODEL,
    'Endermite': BEE_MODEL,
    'Silverfish': BEE_MODEL,
    'Breeze': HUMANOID_MODEL,

    // Villagers
    'Villager': VILLAGER_MODEL,
    'Wandering Trader': VILLAGER_MODEL,
    'Iron Golem': IRON_GOLEM_MODEL,
    'Snow Golem': HUMANOID_MODEL,

    // Bosses
    'Ender Dragon': ENDER_DRAGON_MODEL,
    'Wither': WITHER_MODEL,
};

// ============================================================================
// Bedrock Model Integration
// ============================================================================

/**
 * Mapping of entity names to their expected scale factors
 * These match the fallback model scales for consistency
 */
const ENTITY_SCALES: Record<string, number> = {
    'Bee': 0.5,
    'Chicken': 0.6,
    'Wolf': 0.8,
    'Cat': 0.8,
    'Fox': 0.8,
    'Cow': 0.9,
    'Pig': 0.9,
    'Sheep': 0.9,
    'Blaze': 0.9,
    'Enderman': 1.2,
    'Iron Golem': 1.4,
    'Wither': 1.5,
    'Ghast': 2,
    'Ender Dragon': 2.5,
};

/**
 * Get the scale factor for an entity
 */
export function getEntityScale(entityName: string): number {
    return ENTITY_SCALES[entityName] ?? 1.0;
}

/**
 * Mapping of entity names to their Bedrock .geo.json filenames
 */
const BEDROCK_MODEL_FILES: Record<string, string> = {
    'Bee': 'bee.geo.json',
    'Blaze': 'blaze.geo.json',
    'Breeze': 'breeze.geo.json',
    'Cat': 'cat.geo.json',
    'Chicken': 'chicken.geo.json',
    'Cow': 'cow.geo.json',
    'Creeper': 'creeper.geo.json',
    'Elder Guardian': 'elder_guardian.geo.json',
    'Ender Dragon': 'ender_dragon.geo.json',
    'Enderman': 'enderman.geo.json',
    'Evoker': 'evoker.geo.json',
    'Ghast': 'ghast.geo.json',
    'Guardian': 'guardian.geo.json',
    'Iron Golem': 'iron_golem.geo.json',
    'Magma Cube': 'magma_cube.geo.json',
    'Pig': 'pig.geo.json',
    'Piglin': 'piglin.geo.json',
    'Piglin Brute': 'piglin.geo.json',
    'Pillager': 'pillager.geo.json',
    'Sheep': 'sheep.geo.json',
    'Shulker': 'shulker.geo.json',
    'Silverfish': 'silverfish.geo.json',
    'Skeleton': 'skeleton.geo.json',
    'Slime': 'slime.geo.json',
    'Spider': 'spider.geo.json',
    'Villager': 'villager.geo.json',
    'Vindicator': 'vindicator.geo.json',
    'Warden': 'warden.geo.json',
    'Witch': 'witch.geo.json',
    'Wither': 'wither.geo.json',
    'Wither Skeleton': 'skeleton.geo.json',
    'Wolf': 'wolf.geo.json',
    'Zombie': 'zombie.geo.json',
};

/**
 * Cache for loaded Bedrock models
 */
const bedrockModelCache = new Map<string, EntityModel>();

/**
 * Cache for load promises to avoid duplicate fetches
 */
const loadingPromises = new Map<string, Promise<EntityModel | null>>();

// Clear caches on hot reload in development
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        bedrockModelCache.clear();
        loadingPromises.clear();
        console.log('[EntityModels] Caches cleared on HMR');
    });
}

/**
 * Base path for Bedrock entity models
 */
function getBedrockModelBasePath(): string {
    return import.meta.env.BASE_URL + 'minecraft/models/entity/';
}

/**
 * Asynchronously load a Bedrock model for an entity
 * Returns null if the entity doesn't have a Bedrock model or if loading fails
 */
export async function loadEntityBedrockModel(entityName: string): Promise<EntityModel | null> {
    // Check if already cached
    if (bedrockModelCache.has(entityName)) {
        return bedrockModelCache.get(entityName)!;
    }

    // Check if already loading
    if (loadingPromises.has(entityName)) {
        return loadingPromises.get(entityName)!;
    }

    // Check if entity has a Bedrock model
    const fileName = BEDROCK_MODEL_FILES[entityName];
    if (!fileName) {
        return null;
    }

    // Start loading
    const loadPromise = (async () => {
        try {
            const basePath = getBedrockModelBasePath();
            const fullPath = basePath + fileName;

            console.log(`Loading Bedrock model for ${entityName} from ${fullPath}`);
            const model = await loadBedrockModel(fullPath);

            // Apply entity-specific scale from our scale map
            // This ensures Bedrock models match the expected sizes of fallback models
            model.scale = getEntityScale(entityName);

            // Cache the loaded model
            bedrockModelCache.set(entityName, model);
            console.log(`Successfully loaded Bedrock model for ${entityName} with scale ${model.scale}`);

            return model;
        } catch (error) {
            console.warn(`Failed to load Bedrock model for ${entityName}:`, error);
            return null;
        } finally {
            // Clean up loading promise
            loadingPromises.delete(entityName);
        }
    })();

    loadingPromises.set(entityName, loadPromise);
    return loadPromise;
}

/**
 * Pre-load multiple Bedrock models (useful for initialization)
 */
export async function preloadBedrockEntityModels(entityNames: string[]): Promise<void> {
    const promises = entityNames
        .filter(name => BEDROCK_MODEL_FILES[name])
        .map(name => loadEntityBedrockModel(name));

    await Promise.all(promises);
}

/**
 * Get the synchronously available model for an entity
 * Returns Bedrock model if already loaded, otherwise returns fallback model
 * Use getEntityModelAsync for async loading
 */
export function getEntityModel(entityName: string): EntityModel {
    // Check if Bedrock model is already cached
    const bedrockModel = bedrockModelCache.get(entityName);
    if (bedrockModel) {
        return bedrockModel;
    }

    // Return fallback model
    return ENTITY_MODELS[entityName] || HUMANOID_MODEL;
}

/**
 * Get entity model with async Bedrock loading
 * Tries to load Bedrock model first, falls back to default models
 */
export async function getEntityModelAsync(entityName: string): Promise<EntityModel> {
    // Try to load Bedrock model
    const bedrockModel = await loadEntityBedrockModel(entityName);
    if (bedrockModel) {
        return bedrockModel;
    }

    // Fall back to static models
    return ENTITY_MODELS[entityName] || HUMANOID_MODEL;
}

/**
 * Check if an entity has a Bedrock model available
 */
export function hasBedrockModel(entityName: string): boolean {
    return entityName in BEDROCK_MODEL_FILES;
}

/**
 * Clear all cached Bedrock models
 */
export function clearBedrockModelCache(): void {
    bedrockModelCache.clear();
    loadingPromises.clear();
}
