
export interface BlockDef {
    id: number;
    name: string;
    group: string;    
    category: string; 
    textures: {
        top: string;
        side: string;
        bottom: string;
        front?: string;
        back?: string;
        left?: string;
        right?: string;
    };
    transparent?: boolean;
}

export interface CustomBlockData extends BlockDef {
    textureData: Record<string, string>; 
}

export let BLOCKS: Record<number, BlockDef> = {
    0: { id: 0, name: 'Air', group: 'System', category: 'System', textures: { top: '', side: '', bottom: '' }, transparent: true }
};

let nextId = 1;

const register = (def: BlockDef) => {
    if (BLOCKS[def.id]) {
        console.warn(`Block ID collision: ${def.id} (${def.name})`);
    }
    BLOCKS[def.id] = def;
    nextId = Math.max(nextId, def.id + 1);
};

const simple = (name: string, group: string, category: string, tex: string, transparent = false) => ({
    id: nextId++, name, group, category, textures: { top: tex, side: tex, bottom: tex }, transparent
});

const pillar = (name: string, group: string, category: string, side: string, top: string) => ({
    id: nextId++, name, group, category, textures: { top: top, side: side, bottom: top }
});

const unique = (name: string, group: string, category: string, top: string, side: string, bottom: string, transparent = false) => ({
    id: nextId++, name, group, category, textures: { top, side, bottom }, transparent
});

// Helper for entities - stores relative texture path in 'side' for the loader to use
// Entities are rendered as banner-style flat panels with front/back textures
const entity = (name: string, category: string, path: string) => ({
    id: nextId++,
    name,
    group: 'Entities',
    category,
    textures: {
        top: `${name}_banner_top`,
        bottom: `${name}_banner_bottom`,
        side: path, // Used as path payload for loader
        front: `${name}_banner_front`,
        back: `${name}_banner_back`,
        left: `${name}_banner_front`,  // Use front for left edge
        right: `${name}_banner_front`  // Use front for right edge
    },
    transparent: true // Banners have transparent parts
});

// --- GENERATORS ---

const COLORS = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'];

const WOOD_TYPES = [
    'oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'mangrove', 'cherry', 'bamboo', 'crimson', 'warped', 'pale_oak'
];

const ORES = ['coal', 'iron', 'copper', 'gold', 'redstone', 'emerald', 'lapis', 'diamond'];

// --- POPULATE BLOCKS ---

// Nature / Terrain
register(unique('Grass Block', 'Nature', 'Terrain', 'grass_block_top', 'grass_block_side', 'dirt')); 
register(simple('Dirt', 'Nature', 'Terrain', 'dirt')); 
register(simple('Sand', 'Nature', 'Terrain', 'sand')); 
register(simple('Gravel', 'Nature', 'Terrain', 'gravel')); 
register(simple('Clay', 'Nature', 'Terrain', 'clay')); 
register(simple('Mud', 'Nature', 'Terrain', 'mud'));
register(simple('Packed Mud', 'Nature', 'Terrain', 'packed_mud'));
register(simple('Snow Block', 'Nature', 'Terrain', 'snow'));
register(simple('Ice', 'Nature', 'Terrain', 'ice', true));
register(simple('Packed Ice', 'Nature', 'Terrain', 'packed_ice'));
register(simple('Blue Ice', 'Nature', 'Terrain', 'blue_ice'));
register(unique('Podzol', 'Nature', 'Terrain', 'podzol_top', 'podzol_side', 'dirt'));
register(unique('Mycelium', 'Nature', 'Terrain', 'mycelium_top', 'mycelium_side', 'dirt'));
register(unique('Dirt Path', 'Nature', 'Terrain', 'dirt_path_top', 'dirt_path_side', 'dirt', true)); 

// Stone
register(simple('Stone', 'Building', 'Stone', 'stone')); 
register(simple('Cobblestone', 'Building', 'Stone', 'cobblestone'));
register(simple('Mossy Cobblestone', 'Building', 'Stone', 'mossy_cobblestone'));
register(simple('Smooth Stone', 'Building', 'Stone', 'smooth_stone'));
register(simple('Stone Bricks', 'Building', 'Stone', 'stone_bricks'));
register(simple('Mossy Stone Bricks', 'Building', 'Stone', 'stone_bricks_mossy'));
register(simple('Cracked Stone Bricks', 'Building', 'Stone', 'stone_bricks_cracked'));
register(simple('Chiseled Stone Bricks', 'Building', 'Stone', 'chiseled_stone_bricks'));

// Deepslate
register(pillar('Deepslate', 'Building', 'Stone', 'deepslate', 'deepslate_top'));
register(simple('Cobbled Deepslate', 'Building', 'Stone', 'cobbled_deepslate'));
register(simple('Polished Deepslate', 'Building', 'Stone', 'polished_deepslate'));
register(simple('Deepslate Bricks', 'Building', 'Stone', 'deepslate_bricks'));
register(simple('Deepslate Tiles', 'Building', 'Stone', 'deepslate_tiles'));
register(unique('Reinforced Deepslate', 'Building', 'Stone', 'reinforced_deepslate_top', 'reinforced_deepslate_side', 'reinforced_deepslate_bottom'));

// Granite/Diorite/Andesite
['granite', 'diorite', 'andesite', 'calcite', 'tuff'].forEach(type => {
    register(simple(type.charAt(0).toUpperCase() + type.slice(1), 'Building', 'Stone', type));
    if (['granite', 'diorite', 'andesite'].includes(type)) {
        register(simple(`Polished ${type.charAt(0).toUpperCase() + type.slice(1)}`, 'Building', 'Stone', `polished_${type}`));
    }
});
register(simple('Dripstone Block', 'Building', 'Stone', 'dripstone_block'));

// Woods
WOOD_TYPES.forEach(wood => {
    const name = wood.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    register(simple(`${name} Planks`, 'Building', 'Wood', `${wood}_planks`));
    
    if (wood === 'bamboo') {
        register(pillar('Bamboo Block', 'Building', 'Wood', 'bamboo_block', 'bamboo_block_top'));
        register(pillar('Stripped Bamboo Block', 'Building', 'Wood', 'stripped_bamboo_block', 'stripped_bamboo_block_top'));
    } else {
        const logSuffix = (wood === 'crimson' || wood === 'warped') ? 'stem' : 'log';
        register(pillar(`${name} ${logSuffix === 'stem' ? 'Stem' : 'Log'}`, 'Building', 'Wood', `${wood}_${logSuffix}`, `${wood}_${logSuffix}_top`));
        register(pillar(`Stripped ${name} ${logSuffix === 'stem' ? 'Stem' : 'Log'}`, 'Building', 'Wood', `stripped_${wood}_${logSuffix}`, `stripped_${wood}_${logSuffix}_top`));
    }

    if (!['crimson', 'warped', 'bamboo'].includes(wood)) {
         register(simple(`${name} Leaves`, 'Nature', 'Plants', `${wood}_leaves`, true));
    } else if (wood === 'crimson') {
         register(simple('Nether Wart Block', 'Nature', 'Plants', 'nether_wart_block'));
    } else if (wood === 'warped') {
         register(simple('Warped Wart Block', 'Nature', 'Plants', 'warped_wart_block'));
    }

    register(simple(`${name} Trapdoor`, 'Decoration', 'Utility', `${wood}_trapdoor`, true));
});

// Ores & Minerals
ORES.forEach(ore => {
    const name = ore.charAt(0).toUpperCase() + ore.slice(1);
    register(simple(`${name} Ore`, 'Building', 'Ores', `${ore}_ore`));
    register(simple(`Deepslate ${name} Ore`, 'Building', 'Ores', `deepslate_${ore}_ore`));
    register(simple(`Block of ${name}`, 'Building', 'Mineral', `${ore}_block`));
    if (ore !== 'redstone' && ore !== 'coal' && ore !== 'emerald' && ore !== 'diamond' && ore !== 'lapis') {
         register(simple(`Raw ${name} Block`, 'Building', 'Mineral', `raw_${ore}_block`));
    }
});
register(simple('Nether Quartz Ore', 'Building', 'Ores', 'nether_quartz_ore'));
register(simple('Ancient Debris', 'Building', 'Ores', 'ancient_debris_side')); 
register(simple('Amethyst Block', 'Building', 'Mineral', 'amethyst_block'));
register(simple('Budding Amethyst', 'Building', 'Mineral', 'budding_amethyst'));

// Copper
const copperStates = ['', 'exposed_', 'weathered_', 'oxidized_'];
copperStates.forEach(state => {
    const stateName = state.replace('_', ' ').trim();
    const prefix = stateName ? stateName.charAt(0).toUpperCase() + stateName.slice(1) + ' ' : '';
    
    register(simple(`${prefix}Copper Block`, 'Building', 'Copper', `${state}copper`));
    register(simple(`${prefix}Cut Copper`, 'Building', 'Copper', `${state}cut_copper`));
    register(simple(`${prefix}Chiseled Copper`, 'Building', 'Copper', `${state}chiseled_copper`));
    register(simple(`${prefix}Copper Grate`, 'Building', 'Copper', `${state}copper_grate`, true));
    register(simple(`${prefix}Copper Bulb`, 'Redstone', 'Light', `${state}copper_bulb`));
});

// Colored
COLORS.forEach(color => {
    const cName = color.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    
    register(simple(`${cName} Wool`, 'Decoration', 'Colored', `${color}_wool`));
    register(simple(`${cName} Concrete`, 'Decoration', 'Colored', `${color}_concrete`));
    register(simple(`${cName} Concrete Powder`, 'Decoration', 'Colored', `${color}_concrete_powder`));
    register(simple(`${cName} Terracotta`, 'Decoration', 'Colored', `${color}_terracotta`));
    register(simple(`${cName} Stained Glass`, 'Decoration', 'Colored', `${color}_stained_glass`, true));
    register(unique(`${cName} Glazed Terracotta`, 'Decoration', 'Colored', `${color}_glazed_terracotta`, `${color}_glazed_terracotta`, `${color}_glazed_terracotta`)); 
    register(unique(`${cName} Shulker Box`, 'Decoration', 'Utility', `${color}_shulker_box`, `${color}_shulker_box`, `${color}_shulker_box`));
});
register(simple('Glass', 'Building', 'Glass', 'glass', true));
register(simple('Tinted Glass', 'Building', 'Glass', 'tinted_glass', true));

// Nether
register(simple('Netherrack', 'Nether', 'Terrain', 'netherrack'));
register(simple('Nether Bricks', 'Nether', 'Building', 'nether_bricks'));
register(simple('Red Nether Bricks', 'Nether', 'Building', 'red_nether_bricks'));
register(simple('Chiseled Nether Bricks', 'Nether', 'Building', 'chiseled_nether_bricks'));
register(simple('Soul Sand', 'Nether', 'Terrain', 'soul_sand'));
register(simple('Soul Soil', 'Nether', 'Terrain', 'soul_soil'));
register(simple('Glowstone', 'Nether', 'Terrain', 'glowstone'));
register(simple('Shroomlight', 'Nether', 'Terrain', 'shroomlight'));
register(unique('Basalt', 'Nether', 'Terrain', 'basalt_top', 'basalt_side', 'basalt_top'));
register(unique('Polished Basalt', 'Nether', 'Terrain', 'polished_basalt_top', 'polished_basalt_side', 'polished_basalt_top'));
register(unique('Blackstone', 'Nether', 'Building', 'blackstone_top', 'blackstone', 'blackstone_top'));
register(simple('Polished Blackstone', 'Nether', 'Building', 'polished_blackstone'));
register(simple('Polished Blackstone Bricks', 'Nether', 'Building', 'polished_blackstone_bricks'));
register(simple('Gilded Blackstone', 'Nether', 'Building', 'gilded_blackstone'));
register(simple('Magma Block', 'Nether', 'Terrain', 'magma'));
register(unique('Crimson Nylium', 'Nether', 'Terrain', 'crimson_nylium', 'crimson_nylium_side', 'netherrack'));
register(unique('Warped Nylium', 'Nether', 'Terrain', 'warped_nylium', 'warped_nylium_side', 'netherrack'));

// Sculk
register(simple('Sculk', 'Nature', 'Sculk', 'sculk'));
register(simple('Sculk Catalyst', 'Nature', 'Sculk', 'sculk_catalyst_top')); 
register(simple('Sculk Shrieker', 'Nature', 'Sculk', 'sculk_shrieker_top')); 
register(simple('Sculk Sensor', 'Nature', 'Sculk', 'sculk_sensor_top')); 

// Trial
register(simple('Trial Spawner', 'Building', 'Trial', 'trial_spawner_top')); 
register(simple('Vault', 'Building', 'Trial', 'vault_front')); 
register(unique('Heavy Core', 'Building', 'Trial', 'heavy_core_top', 'heavy_core_side', 'heavy_core_bottom'));

// Utility & Redstone
register(unique('Crafting Table', 'Utility', 'General', 'crafting_table_top', 'crafting_table_side', 'crafting_table_top')); 
register(unique('Furnace', 'Utility', 'General', 'furnace_top', 'furnace_front', 'furnace_top'));
register(unique('Smoker', 'Utility', 'General', 'smoker_top', 'smoker_front', 'smoker_bottom'));
register(unique('Blast Furnace', 'Utility', 'General', 'blast_furnace_top', 'blast_furnace_front', 'blast_furnace_top'));
register(unique('Chest', 'Utility', 'Storage', 'chest_top', 'chest_side', 'chest_top')); 
register(unique('Barrel', 'Utility', 'Storage', 'barrel_top', 'barrel_side', 'barrel_bottom'));
register(unique('Bookshelf', 'Decoration', 'Furniture', 'oak_planks', 'bookshelf', 'oak_planks'));
register(unique('Tnt', 'Redstone', 'Explosive', 'tnt_top', 'tnt_side', 'tnt_bottom'));
register(unique('Piston', 'Redstone', 'Mech', 'piston_top', 'piston_side', 'piston_bottom'));
register(unique('Sticky Piston', 'Redstone', 'Mech', 'piston_top_sticky', 'piston_side', 'piston_bottom'));
register(unique('Observer', 'Redstone', 'Mech', 'observer_top', 'observer_side', 'observer_back'));
register(unique('Dispenser', 'Redstone', 'Mech', 'dispenser_top', 'dispenser_front', 'dispenser_top'));
register(unique('Dropper', 'Redstone', 'Mech', 'dropper_top', 'dropper_front', 'dropper_top'));
register(simple('Target', 'Redstone', 'Mech', 'target_top'));
register(simple('Redstone Lamp', 'Redstone', 'Light', 'redstone_lamp'));
register(simple('Sea Lantern', 'Building', 'Light', 'sea_lantern'));
register(simple('Ochre Froglight', 'Building', 'Light', 'ochre_froglight'));
register(simple('Verdant Froglight', 'Building', 'Light', 'verdant_froglight'));
register(simple('Pearlescent Froglight', 'Building', 'Light', 'pearlescent_froglight'));

// Plants 
register(unique('Melon', 'Nature', 'Plants', 'melon_top', 'melon_side', 'melon_top'));
register(unique('Pumpkin', 'Nature', 'Plants', 'pumpkin_top', 'pumpkin_side', 'pumpkin_top'));
register(unique('Carved Pumpkin', 'Nature', 'Plants', 'pumpkin_top', 'carved_pumpkin', 'pumpkin_top'));
register(unique('Jack o Lantern', 'Nature', 'Plants', 'pumpkin_top', 'jack_o_lantern', 'pumpkin_top'));
register(unique('Hay Bale', 'Nature', 'Plants', 'hay_block_top', 'hay_block_side', 'hay_block_top'));
register(unique('Cactus', 'Nature', 'Plants', 'cactus_top', 'cactus_side', 'cactus_bottom', true));
register(simple('Sponge', 'Nature', 'Sea', 'sponge'));
register(simple('Wet Sponge', 'Nature', 'Sea', 'wet_sponge'));

// End
register(simple('End Stone', 'Building', 'End', 'end_stone'));
register(simple('End Stone Bricks', 'Building', 'End', 'end_stone_bricks'));
register(simple('Purpur Block', 'Building', 'End', 'purpur_block'));
register(pillar('Purpur Pillar', 'Building', 'End', 'purpur_pillar', 'purpur_pillar_top'));

// --- ENTITIES ---

const PASSIVE = ['cow', 'pig', 'sheep', 'chicken', 'horse', 'wolf', 'cat', 'rabbit', 'fox', 'bee', 'axolotl', 'frog', 'sniffer', 'armadillo'];
const HOSTILE = ['zombie', 'skeleton', 'creeper', 'spider', 'enderman', 'blaze', 'ghast', 'wither_skeleton', 'piglin', 'hoglin', 'warden'];
const VILLAGER = ['villager', 'wandering_trader', 'iron_golem'];
const BOSS = ['ender_dragon', 'wither'];

PASSIVE.forEach(e => register(entity(e.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), 'Passive', e)));
HOSTILE.forEach(e => register(entity(e.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), 'Hostile', e)));
VILLAGER.forEach(e => register(entity(e.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), 'Villager', e)));
BOSS.forEach(e => register(entity(e.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), 'Boss', e)));

export const registerCustomBlock = (def: BlockDef) => {
    BLOCKS[def.id] = def;
};

export const getNextBlockId = (): number => {
    const ids = Object.keys(BLOCKS).map(Number).filter(id => id >= 1000);
    if (ids.length === 0) return 1000;
    return Math.max(...ids) + 1;
};
