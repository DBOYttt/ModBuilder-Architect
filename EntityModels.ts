// Entity model definitions matching Minecraft's actual entity models
// All dimensions are in pixels (1 block = 16 pixels)

export interface ModelPart {
    name: string;
    // Position offset from entity origin (in blocks)
    origin: [number, number, number];
    // Size in pixels
    size: [number, number, number];
    // UV coordinates on texture (top-left corner)
    uv: [number, number];
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

    // Hostile
    'Zombie': HUMANOID_MODEL,
    'Skeleton': HUMANOID_MODEL,
    'Creeper': CREEPER_MODEL,
    'Spider': SPIDER_MODEL,
    'Enderman': ENDERMAN_MODEL,
    'Blaze': BLAZE_MODEL,
    'Ghast': GHAST_MODEL,
    'Wither Skeleton': HUMANOID_MODEL,
    'Piglin': HUMANOID_MODEL,
    'Hoglin': QUADRUPED_MODEL,
    'Warden': HUMANOID_MODEL,

    // Villagers
    'Villager': VILLAGER_MODEL,
    'Wandering Trader': VILLAGER_MODEL,
    'Iron Golem': IRON_GOLEM_MODEL,

    // Bosses
    'Ender Dragon': CUBE_MODEL, // Simplified
    'Wither': HUMANOID_MODEL,
};

// Get model for an entity, defaulting to humanoid
export function getEntityModel(entityName: string): EntityModel {
    return ENTITY_MODELS[entityName] || HUMANOID_MODEL;
}
