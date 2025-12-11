// Auto-generated Minecraft block definitions
// Generated from 954 textures

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

const register = (def: Omit<BlockDef, 'id'>) => {
    const id = nextId++;
    BLOCKS[id] = { ...def, id };
};

// Helper functions
const simple = (name: string, group: string, category: string, tex: string, transparent = false) =>
    register({ name, group, category, textures: { top: tex, side: tex, bottom: tex }, transparent });

const pillar = (name: string, group: string, category: string, side: string, top: string) =>
    register({ name, group, category, textures: { top, side, bottom: top } });

const unique = (name: string, group: string, category: string, top: string, side: string, bottom: string, transparent = false) =>
    register({ name, group, category, textures: { top, side, bottom }, transparent });

const directional = (name: string, group: string, category: string, top: string, side: string, front: string, bottom?: string) =>
    register({ name, group, category, textures: { top, side, bottom: bottom || top, front } });

// ============ BLOCKS ============


// ========== BUILDING ==========

// --- Copper ---
simple('Chiseled Copper', 'Building', 'Copper', 'chiseled_copper');
unique('Copper Door', 'Building', 'Copper', 'copper_door_top', 'copper_door_bottom', 'copper_door_bottom');
simple('Copper Grate', 'Building', 'Copper', 'copper_grate');
simple('Copper Trapdoor', 'Building', 'Copper', 'copper_trapdoor');
simple('Cut Copper', 'Building', 'Copper', 'cut_copper');
simple('Exposed Chiseled Copper', 'Building', 'Copper', 'exposed_chiseled_copper');
simple('Exposed Copper', 'Building', 'Copper', 'exposed_copper');
unique('Exposed Copper Door', 'Building', 'Copper', 'exposed_copper_door_top', 'exposed_copper_door_bottom', 'exposed_copper_door_bottom');
simple('Exposed Copper Grate', 'Building', 'Copper', 'exposed_copper_grate');
simple('Exposed Copper Trapdoor', 'Building', 'Copper', 'exposed_copper_trapdoor');
simple('Exposed Cut Copper', 'Building', 'Copper', 'exposed_cut_copper');
simple('Oxidized Chiseled Copper', 'Building', 'Copper', 'oxidized_chiseled_copper');
simple('Oxidized Copper', 'Building', 'Copper', 'oxidized_copper');
unique('Oxidized Copper Door', 'Building', 'Copper', 'oxidized_copper_door_top', 'oxidized_copper_door_bottom', 'oxidized_copper_door_bottom');
simple('Oxidized Copper Grate', 'Building', 'Copper', 'oxidized_copper_grate');
simple('Oxidized Copper Trapdoor', 'Building', 'Copper', 'oxidized_copper_trapdoor');
simple('Oxidized Cut Copper', 'Building', 'Copper', 'oxidized_cut_copper');

// --- End ---
simple('Chorus Plant', 'Building', 'End', 'chorus_plant');
pillar('End Portal Frame', 'Building', 'End', 'end_portal_frame_side', 'end_portal_frame_top');
simple('End Portal Frame Eye', 'Building', 'End', 'end_portal_frame_eye');
simple('End Rod', 'Building', 'End', 'end_rod');
simple('Purpur Block', 'Building', 'End', 'purpur_block');
unique('Purpur Pillar', 'Building', 'End', 'purpur_pillar_top', 'purpur_pillar', 'purpur_pillar_top');

// --- Mineral ---
simple('Amethyst Block', 'Building', 'Mineral', 'amethyst_block');
simple('Coal Block', 'Building', 'Mineral', 'coal_block');
simple('Copper Block', 'Building', 'Mineral', 'copper_block');
simple('Diamond Block', 'Building', 'Mineral', 'diamond_block');
simple('Emerald Block', 'Building', 'Mineral', 'emerald_block');
simple('Gold Block', 'Building', 'Mineral', 'gold_block');
simple('Iron Block', 'Building', 'Mineral', 'iron_block');
simple('Lapis Block', 'Building', 'Mineral', 'lapis_block');
simple('Netherite Block', 'Building', 'Mineral', 'netherite_block');
simple('Raw Copper Block', 'Building', 'Mineral', 'raw_copper_block');
simple('Raw Gold Block', 'Building', 'Mineral', 'raw_gold_block');
simple('Raw Iron Block', 'Building', 'Mineral', 'raw_iron_block');
simple('Redstone Block', 'Building', 'Mineral', 'redstone_block');

// --- Misc ---
simple('Activator Rail', 'Building', 'Misc', 'activator_rail');
simple('Allium', 'Building', 'Misc', 'allium');
simple('Amethyst Cluster', 'Building', 'Misc', 'amethyst_cluster');
simple('Azure Bluet', 'Building', 'Misc', 'azure_bluet');
simple('Bedrock', 'Building', 'Misc', 'bedrock');
pillar('Bee Nest', 'Building', 'Misc', 'bee_nest_side', 'bee_nest_top');
simple('Bee Nest Front Honey', 'Building', 'Misc', 'bee_nest_front_honey', true);
pillar('Beehive', 'Building', 'Misc', 'beehive_side', 'beehive_end');
simple('Beehive Front Honey', 'Building', 'Misc', 'beehive_front_honey', true);
pillar('Bell', 'Building', 'Misc', 'bell_side', 'bell_top');
pillar('Bone Block', 'Building', 'Misc', 'bone_block_side', 'bone_block_top');
simple('Bookshelf', 'Building', 'Misc', 'bookshelf');
simple('Bricks', 'Building', 'Misc', 'bricks');
simple('Budding Amethyst', 'Building', 'Misc', 'budding_amethyst');
pillar('Cake', 'Building', 'Misc', 'cake_side', 'cake_top');
simple('Campfire Fire', 'Building', 'Misc', 'campfire_fire');
simple('Campfire Log', 'Building', 'Misc', 'campfire_log');
simple('Candle', 'Building', 'Misc', 'candle');
simple('Chain', 'Building', 'Misc', 'chain', true);
pillar('Chiseled Bookshelf', 'Building', 'Misc', 'chiseled_bookshelf_side', 'chiseled_bookshelf_top');
simple('Chiseled Bookshelf Empty', 'Building', 'Misc', 'chiseled_bookshelf_empty');
simple('Chiseled Bookshelf Occupied', 'Building', 'Misc', 'chiseled_bookshelf_occupied');
unique('Chiseled Quartz Block', 'Building', 'Misc', 'chiseled_quartz_block_top', 'chiseled_quartz_block', 'chiseled_quartz_block_top');
simple('Cobweb', 'Building', 'Misc', 'cobweb');
unique('Crafter', 'Building', 'Misc', 'crafter_top', 'crafter_bottom', 'crafter_bottom');
simple('Crafter East', 'Building', 'Misc', 'crafter_east');
simple('Crafter East Triggered', 'Building', 'Misc', 'crafter_east_triggered');
simple('Crafter North', 'Building', 'Misc', 'crafter_north');
simple('Crafter South', 'Building', 'Misc', 'crafter_south');
simple('Crafter South Triggered', 'Building', 'Misc', 'crafter_south_triggered');
simple('Crafter Top Triggered', 'Building', 'Misc', 'crafter_top_triggered');
simple('Crafter West', 'Building', 'Misc', 'crafter_west');
simple('Crafter West Triggered', 'Building', 'Misc', 'crafter_west_triggered');
simple('Crying Obsidian', 'Building', 'Misc', 'crying_obsidian');
pillar('Daylight Detector', 'Building', 'Misc', 'daylight_detector_side', 'daylight_detector_top');
simple('Detector Rail', 'Building', 'Misc', 'detector_rail');
simple('Dragon Egg', 'Building', 'Misc', 'dragon_egg');
simple('Farmland', 'Building', 'Misc', 'farmland');
simple('Farmland Moist', 'Building', 'Misc', 'farmland_moist');
simple('Fire 0', 'Building', 'Misc', 'fire_0');
simple('Fire 1', 'Building', 'Misc', 'fire_1');
simple('Frogspawn', 'Building', 'Misc', 'frogspawn');
simple('Glass', 'Building', 'Misc', 'glass', true);
simple('Glow Item Frame', 'Building', 'Misc', 'glow_item_frame');
simple('Glow Lichen', 'Building', 'Misc', 'glow_lichen');
simple('Hanging Roots', 'Building', 'Misc', 'hanging_roots');
pillar('Hay Block', 'Building', 'Misc', 'hay_block_side', 'hay_block_top');
simple('Heavy Core', 'Building', 'Misc', 'heavy_core');
pillar('Honey Block', 'Building', 'Misc', 'honey_block_side', 'honey_block_top');
simple('Honeycomb Block', 'Building', 'Misc', 'honeycomb_block', true);
simple('Iron Bars', 'Building', 'Misc', 'iron_bars', true);
unique('Iron Door', 'Building', 'Misc', 'iron_door_top', 'iron_door_bottom', 'iron_door_bottom');
simple('Iron Trapdoor', 'Building', 'Misc', 'iron_trapdoor');
simple('Item Frame', 'Building', 'Misc', 'item_frame');
pillar('Jigsaw', 'Building', 'Misc', 'jigsaw_side', 'jigsaw_top');
simple('Jigsaw Lock', 'Building', 'Misc', 'jigsaw_lock');
pillar('Jukebox', 'Building', 'Misc', 'jukebox_side', 'jukebox_top');
simple('Ladder', 'Building', 'Misc', 'ladder');
simple('Large Amethyst Bud', 'Building', 'Misc', 'large_amethyst_bud');
simple('Lightning Rod', 'Building', 'Misc', 'lightning_rod');
unique('Lilac', 'Building', 'Misc', 'lilac_top', 'lilac_bottom', 'lilac_bottom');
simple('Mangrove Propagule', 'Building', 'Misc', 'mangrove_propagule');
simple('Mangrove Propagule Hanging', 'Building', 'Misc', 'mangrove_propagule_hanging');
pillar('Mangrove Roots', 'Building', 'Misc', 'mangrove_roots_side', 'mangrove_roots_top');
simple('Medium Amethyst Bud', 'Building', 'Misc', 'medium_amethyst_bud');
simple('Note Block', 'Building', 'Misc', 'note_block');
simple('Obsidian', 'Building', 'Misc', 'obsidian');
simple('Oxeye Daisy', 'Building', 'Misc', 'oxeye_daisy');
unique('Peony', 'Building', 'Misc', 'peony_top', 'peony_bottom', 'peony_bottom');
pillar('Pitcher Crop', 'Building', 'Misc', 'pitcher_crop_side', 'pitcher_crop_top');
simple('Powered Rail', 'Building', 'Misc', 'powered_rail');
pillar('Quartz Block', 'Building', 'Misc', 'quartz_block_side', 'quartz_block_top');
simple('Quartz Bricks', 'Building', 'Misc', 'quartz_bricks');
unique('Quartz Pillar', 'Building', 'Misc', 'quartz_pillar_top', 'quartz_pillar', 'quartz_pillar_top');
simple('Rail', 'Building', 'Misc', 'rail');
simple('Rail Corner', 'Building', 'Misc', 'rail_corner');
pillar('Scaffolding', 'Building', 'Misc', 'scaffolding_side', 'scaffolding_top');
simple('Shulker Box', 'Building', 'Misc', 'shulker_box');
simple('Slime Block', 'Building', 'Misc', 'slime_block', true);
simple('Small Amethyst Bud', 'Building', 'Misc', 'small_amethyst_bud');
unique('Sniffer Egg Not Cracked', 'Building', 'Misc', 'sniffer_egg_not_cracked_top', 'sniffer_egg_not_cracked_bottom', 'sniffer_egg_not_cracked_bottom');
simple('Sniffer Egg Not Cracked East', 'Building', 'Misc', 'sniffer_egg_not_cracked_east');
simple('Sniffer Egg Not Cracked North', 'Building', 'Misc', 'sniffer_egg_not_cracked_north');
simple('Sniffer Egg Not Cracked South', 'Building', 'Misc', 'sniffer_egg_not_cracked_south');
simple('Sniffer Egg Not Cracked West', 'Building', 'Misc', 'sniffer_egg_not_cracked_west');
unique('Sniffer Egg Slightly Cracked', 'Building', 'Misc', 'sniffer_egg_slightly_cracked_top', 'sniffer_egg_slightly_cracked_bottom', 'sniffer_egg_slightly_cracked_bottom');
simple('Sniffer Egg Slightly Cracked East', 'Building', 'Misc', 'sniffer_egg_slightly_cracked_east');
simple('Sniffer Egg Slightly Cracked North', 'Building', 'Misc', 'sniffer_egg_slightly_cracked_north');
simple('Sniffer Egg Slightly Cracked South', 'Building', 'Misc', 'sniffer_egg_slightly_cracked_south');
simple('Sniffer Egg Slightly Cracked West', 'Building', 'Misc', 'sniffer_egg_slightly_cracked_west');
unique('Sniffer Egg Very Cracked', 'Building', 'Misc', 'sniffer_egg_very_cracked_top', 'sniffer_egg_very_cracked_bottom', 'sniffer_egg_very_cracked_bottom');
simple('Sniffer Egg Very Cracked East', 'Building', 'Misc', 'sniffer_egg_very_cracked_east');
simple('Sniffer Egg Very Cracked North', 'Building', 'Misc', 'sniffer_egg_very_cracked_north');
simple('Sniffer Egg Very Cracked South', 'Building', 'Misc', 'sniffer_egg_very_cracked_south');
simple('Sniffer Egg Very Cracked West', 'Building', 'Misc', 'sniffer_egg_very_cracked_west');
simple('Spawner', 'Building', 'Misc', 'spawner');
unique('Stripped Acacia Log', 'Building', 'Misc', 'stripped_acacia_log_top', 'stripped_acacia_log', 'stripped_acacia_log_top');
unique('Stripped Birch Log', 'Building', 'Misc', 'stripped_birch_log_top', 'stripped_birch_log', 'stripped_birch_log_top');
unique('Stripped Cherry Log', 'Building', 'Misc', 'stripped_cherry_log_top', 'stripped_cherry_log', 'stripped_cherry_log_top');
unique('Stripped Dark Oak Log', 'Building', 'Misc', 'stripped_dark_oak_log_top', 'stripped_dark_oak_log', 'stripped_dark_oak_log_top');
unique('Stripped Jungle Log', 'Building', 'Misc', 'stripped_jungle_log_top', 'stripped_jungle_log', 'stripped_jungle_log_top');
unique('Stripped Mangrove Log', 'Building', 'Misc', 'stripped_mangrove_log_top', 'stripped_mangrove_log', 'stripped_mangrove_log_top');
unique('Stripped Oak Log', 'Building', 'Misc', 'stripped_oak_log_top', 'stripped_oak_log', 'stripped_oak_log_top');
unique('Stripped Spruce Log', 'Building', 'Misc', 'stripped_spruce_log_top', 'stripped_spruce_log', 'stripped_spruce_log_top');
simple('Structure Block', 'Building', 'Misc', 'structure_block');
simple('Structure Block Corner', 'Building', 'Misc', 'structure_block_corner');
simple('Structure Block Data', 'Building', 'Misc', 'structure_block_data');
simple('Structure Block Load', 'Building', 'Misc', 'structure_block_load');
simple('Structure Block Save', 'Building', 'Misc', 'structure_block_save');
simple('Sugar Cane', 'Building', 'Misc', 'sugar_cane');
simple('Terracotta', 'Building', 'Misc', 'terracotta');
simple('Tinted Glass', 'Building', 'Misc', 'tinted_glass', true);
pillar('Tnt', 'Building', 'Misc', 'tnt_side', 'tnt_top');
simple('Trial Spawner Side Active', 'Building', 'Misc', 'trial_spawner_side_active');
simple('Trial Spawner Side Active Ominous', 'Building', 'Misc', 'trial_spawner_side_active_ominous');
simple('Trial Spawner Side Inactive', 'Building', 'Misc', 'trial_spawner_side_inactive');
simple('Trial Spawner Side Inactive Ominous', 'Building', 'Misc', 'trial_spawner_side_inactive_ominous');
simple('Trial Spawner Top Active', 'Building', 'Misc', 'trial_spawner_top_active');
simple('Trial Spawner Top Active Ominous', 'Building', 'Misc', 'trial_spawner_top_active_ominous');
simple('Trial Spawner Top Ejecting Reward', 'Building', 'Misc', 'trial_spawner_top_ejecting_reward');
simple('Trial Spawner Top Ejecting Reward Ominous', 'Building', 'Misc', 'trial_spawner_top_ejecting_reward_ominous');
simple('Trial Spawner Top Inactive', 'Building', 'Misc', 'trial_spawner_top_inactive');
simple('Trial Spawner Top Inactive Ominous', 'Building', 'Misc', 'trial_spawner_top_inactive_ominous');
simple('Tripwire', 'Building', 'Misc', 'tripwire');
simple('Tripwire Hook', 'Building', 'Misc', 'tripwire_hook');
simple('Turtle Egg', 'Building', 'Misc', 'turtle_egg');
simple('Turtle Egg Slightly Cracked', 'Building', 'Misc', 'turtle_egg_slightly_cracked');
simple('Turtle Egg Very Cracked', 'Building', 'Misc', 'turtle_egg_very_cracked');
unique('Vault', 'Building', 'Misc', 'vault_top', 'vault_bottom', 'vault_bottom');
simple('Vault Bottom Ominous', 'Building', 'Misc', 'vault_bottom_ominous');
simple('Vault Front', 'Building', 'Misc', 'vault_front_on');
simple('Vault Front Ejecting', 'Building', 'Misc', 'vault_front_ejecting');
simple('Vault Front Ejecting Ominous', 'Building', 'Misc', 'vault_front_ejecting_ominous');
simple('Vault Front Off', 'Building', 'Misc', 'vault_front_off');
simple('Vault Front Off Ominous', 'Building', 'Misc', 'vault_front_off_ominous');
simple('Vault Front On Ominous', 'Building', 'Misc', 'vault_front_on_ominous');
simple('Vault Side', 'Building', 'Misc', 'vault_side_on');
simple('Vault Side Off', 'Building', 'Misc', 'vault_side_off');
simple('Vault Side Off Ominous', 'Building', 'Misc', 'vault_side_off_ominous');
simple('Vault Side On Ominous', 'Building', 'Misc', 'vault_side_on_ominous');
simple('Vault Top Ejecting', 'Building', 'Misc', 'vault_top_ejecting');
simple('Vault Top Ejecting Ominous', 'Building', 'Misc', 'vault_top_ejecting_ominous');
simple('Vault Top Ominous', 'Building', 'Misc', 'vault_top_ominous');

// --- Ocean ---
simple('Conduit', 'Building', 'Ocean', 'conduit');
simple('Dark Prismarine', 'Building', 'Ocean', 'dark_prismarine');
simple('Prismarine', 'Building', 'Ocean', 'prismarine');
simple('Prismarine Bricks', 'Building', 'Ocean', 'prismarine_bricks');
simple('Sea Pickle', 'Building', 'Ocean', 'sea_pickle');
simple('Sponge', 'Building', 'Ocean', 'sponge');

// --- Ores ---
pillar('Ancient Debris', 'Building', 'Ores', 'ancient_debris_side', 'ancient_debris_top');
simple('Coal Ore', 'Building', 'Ores', 'coal_ore');
simple('Copper Ore', 'Building', 'Ores', 'copper_ore');
simple('Deepslate Coal Ore', 'Building', 'Ores', 'deepslate_coal_ore');
simple('Deepslate Copper Ore', 'Building', 'Ores', 'deepslate_copper_ore');
simple('Deepslate Diamond Ore', 'Building', 'Ores', 'deepslate_diamond_ore');
simple('Deepslate Emerald Ore', 'Building', 'Ores', 'deepslate_emerald_ore');
simple('Deepslate Gold Ore', 'Building', 'Ores', 'deepslate_gold_ore');
simple('Deepslate Iron Ore', 'Building', 'Ores', 'deepslate_iron_ore');
simple('Deepslate Lapis Ore', 'Building', 'Ores', 'deepslate_lapis_ore');
simple('Deepslate Redstone Ore', 'Building', 'Ores', 'deepslate_redstone_ore');
simple('Diamond Ore', 'Building', 'Ores', 'diamond_ore');
simple('Emerald Ore', 'Building', 'Ores', 'emerald_ore');
simple('Gold Ore', 'Building', 'Ores', 'gold_ore');
simple('Iron Ore', 'Building', 'Ores', 'iron_ore');
simple('Lapis Ore', 'Building', 'Ores', 'lapis_ore');
simple('Nether Gold Ore', 'Building', 'Ores', 'nether_gold_ore');
simple('Nether Quartz Ore', 'Building', 'Ores', 'nether_quartz_ore');
simple('Redstone Ore', 'Building', 'Ores', 'redstone_ore');

// --- Stone ---
simple('Andesite', 'Building', 'Stone', 'andesite');
unique('Blackstone', 'Building', 'Stone', 'blackstone_top', 'blackstone', 'blackstone_top');
simple('Calcite', 'Building', 'Stone', 'calcite');
simple('Chiseled Deepslate', 'Building', 'Stone', 'chiseled_deepslate');
simple('Chiseled Polished Blackstone', 'Building', 'Stone', 'chiseled_polished_blackstone');
simple('Chiseled Red Sandstone', 'Building', 'Stone', 'chiseled_red_sandstone');
simple('Chiseled Sandstone', 'Building', 'Stone', 'chiseled_sandstone');
simple('Chiseled Stone Bricks', 'Building', 'Stone', 'chiseled_stone_bricks');
unique('Chiseled Tuff', 'Building', 'Stone', 'chiseled_tuff_top', 'chiseled_tuff', 'chiseled_tuff_top');
unique('Chiseled Tuff Bricks', 'Building', 'Stone', 'chiseled_tuff_bricks_top', 'chiseled_tuff_bricks', 'chiseled_tuff_bricks_top');
simple('Cobbled Deepslate', 'Building', 'Stone', 'cobbled_deepslate');
simple('Cobblestone', 'Building', 'Stone', 'cobblestone');
simple('Cracked Deepslate Bricks', 'Building', 'Stone', 'cracked_deepslate_bricks');
simple('Cracked Deepslate Tiles', 'Building', 'Stone', 'cracked_deepslate_tiles');
simple('Cracked Polished Blackstone Bricks', 'Building', 'Stone', 'cracked_polished_blackstone_bricks');
simple('Cracked Stone Bricks', 'Building', 'Stone', 'cracked_stone_bricks');
simple('Cut Red Sandstone', 'Building', 'Stone', 'cut_red_sandstone');
simple('Cut Sandstone', 'Building', 'Stone', 'cut_sandstone');
unique('Deepslate', 'Building', 'Stone', 'deepslate_top', 'deepslate', 'deepslate_top');
simple('Deepslate Bricks', 'Building', 'Stone', 'deepslate_bricks');
simple('Deepslate Tiles', 'Building', 'Stone', 'deepslate_tiles');
simple('Diorite', 'Building', 'Stone', 'diorite');
simple('Dripstone Block', 'Building', 'Stone', 'dripstone_block');
simple('End Stone', 'Building', 'Stone', 'end_stone');
simple('End Stone Bricks', 'Building', 'Stone', 'end_stone_bricks');
simple('Gilded Blackstone', 'Building', 'Stone', 'gilded_blackstone');
simple('Glowstone', 'Building', 'Stone', 'glowstone');
simple('Granite', 'Building', 'Stone', 'granite');
simple('Grindstone Pivot', 'Building', 'Stone', 'grindstone_pivot');
simple('Grindstone Round', 'Building', 'Stone', 'grindstone_round');
pillar('Lodestone', 'Building', 'Stone', 'lodestone_side', 'lodestone_top');
simple('Mossy Cobblestone', 'Building', 'Stone', 'mossy_cobblestone');
simple('Mossy Stone Bricks', 'Building', 'Stone', 'mossy_stone_bricks');
simple('Pointed Dripstone Down Base', 'Building', 'Stone', 'pointed_dripstone_down_base');
simple('Pointed Dripstone Down Frustum', 'Building', 'Stone', 'pointed_dripstone_down_frustum');
simple('Pointed Dripstone Down Middle', 'Building', 'Stone', 'pointed_dripstone_down_middle');
simple('Pointed Dripstone Down Tip', 'Building', 'Stone', 'pointed_dripstone_down_tip');
simple('Pointed Dripstone Down Tip Merge', 'Building', 'Stone', 'pointed_dripstone_down_tip_merge');
simple('Pointed Dripstone Up Base', 'Building', 'Stone', 'pointed_dripstone_up_base');
simple('Pointed Dripstone Up Frustum', 'Building', 'Stone', 'pointed_dripstone_up_frustum');
simple('Pointed Dripstone Up Middle', 'Building', 'Stone', 'pointed_dripstone_up_middle');
simple('Pointed Dripstone Up Tip', 'Building', 'Stone', 'pointed_dripstone_up_tip');
simple('Pointed Dripstone Up Tip Merge', 'Building', 'Stone', 'pointed_dripstone_up_tip_merge');
simple('Polished Andesite', 'Building', 'Stone', 'polished_andesite');
simple('Polished Blackstone', 'Building', 'Stone', 'polished_blackstone');
simple('Polished Blackstone Bricks', 'Building', 'Stone', 'polished_blackstone_bricks');
simple('Polished Deepslate', 'Building', 'Stone', 'polished_deepslate');
simple('Polished Diorite', 'Building', 'Stone', 'polished_diorite');
simple('Polished Granite', 'Building', 'Stone', 'polished_granite');
simple('Polished Tuff', 'Building', 'Stone', 'polished_tuff');
simple('Redstone Lamp', 'Building', 'Stone', 'redstone_lamp');
simple('Redstone Torch', 'Building', 'Stone', 'redstone_torch');
simple('Redstone Torch Off', 'Building', 'Stone', 'redstone_torch_off');
pillar('Reinforced Deepslate', 'Building', 'Stone', 'reinforced_deepslate_side', 'reinforced_deepslate_top');
unique('Sandstone', 'Building', 'Stone', 'sandstone_top', 'sandstone', 'sandstone_bottom');
simple('Smooth Stone', 'Building', 'Stone', 'smooth_stone');
simple('Stone', 'Building', 'Stone', 'stone');
simple('Stone Bricks', 'Building', 'Stone', 'stone_bricks');
pillar('Stonecutter', 'Building', 'Stone', 'stonecutter_side', 'stonecutter_top');
simple('Stonecutter Saw', 'Building', 'Stone', 'stonecutter_saw');
simple('Tuff', 'Building', 'Stone', 'tuff');
simple('Tuff Bricks', 'Building', 'Stone', 'tuff_bricks');

// --- Wood ---
unique('Acacia Log', 'Building', 'Wood', 'acacia_log_top', 'acacia_log', 'acacia_log_top');
simple('Acacia Planks', 'Building', 'Wood', 'acacia_planks');
simple('Bamboo Planks', 'Building', 'Wood', 'bamboo_planks');
unique('Birch Log', 'Building', 'Wood', 'birch_log_top', 'birch_log', 'birch_log_top');
simple('Birch Planks', 'Building', 'Wood', 'birch_planks');
unique('Cherry Log', 'Building', 'Wood', 'cherry_log_top', 'cherry_log', 'cherry_log_top');
simple('Cherry Planks', 'Building', 'Wood', 'cherry_planks');
simple('Crimson Planks', 'Building', 'Wood', 'crimson_planks');
unique('Crimson Stem', 'Building', 'Wood', 'crimson_stem_top', 'crimson_stem', 'crimson_stem_top');
unique('Dark Oak Log', 'Building', 'Wood', 'dark_oak_log_top', 'dark_oak_log', 'dark_oak_log_top');
simple('Dark Oak Planks', 'Building', 'Wood', 'dark_oak_planks');
unique('Jungle Log', 'Building', 'Wood', 'jungle_log_top', 'jungle_log', 'jungle_log_top');
simple('Jungle Planks', 'Building', 'Wood', 'jungle_planks');
unique('Mangrove Log', 'Building', 'Wood', 'mangrove_log_top', 'mangrove_log', 'mangrove_log_top');
simple('Mangrove Planks', 'Building', 'Wood', 'mangrove_planks');
unique('Oak Log', 'Building', 'Wood', 'oak_log_top', 'oak_log', 'oak_log_top');
simple('Oak Planks', 'Building', 'Wood', 'oak_planks');
unique('Spruce Log', 'Building', 'Wood', 'spruce_log_top', 'spruce_log', 'spruce_log_top');
simple('Spruce Planks', 'Building', 'Wood', 'spruce_planks');

// ========== DECORATION ==========

// --- Colored ---
simple('Blue Ice', 'Decoration', 'Colored', 'blue_ice', true);
simple('Blue Orchid', 'Decoration', 'Colored', 'blue_orchid');
simple('Brown Mushroom', 'Decoration', 'Colored', 'brown_mushroom');
simple('Brown Mushroom Block', 'Decoration', 'Colored', 'brown_mushroom_block');
simple('Orange Tulip', 'Decoration', 'Colored', 'orange_tulip');
simple('Pink Petals', 'Decoration', 'Colored', 'pink_petals');
simple('Pink Petals Stem', 'Decoration', 'Colored', 'pink_petals_stem');
simple('Pink Tulip', 'Decoration', 'Colored', 'pink_tulip');
simple('Red Mushroom', 'Decoration', 'Colored', 'red_mushroom');
simple('Red Mushroom Block', 'Decoration', 'Colored', 'red_mushroom_block');
simple('Red Nether Bricks', 'Decoration', 'Colored', 'red_nether_bricks');
simple('Red Sand', 'Decoration', 'Colored', 'red_sand');
unique('Red Sandstone', 'Decoration', 'Colored', 'red_sandstone_top', 'red_sandstone', 'red_sandstone_bottom');
simple('Red Tulip', 'Decoration', 'Colored', 'red_tulip');

// --- Concrete ---
simple('Black Concrete', 'Decoration', 'Concrete', 'black_concrete');
simple('Black Concrete Powder', 'Decoration', 'Concrete', 'black_concrete_powder');
simple('Blue Concrete', 'Decoration', 'Concrete', 'blue_concrete');
simple('Blue Concrete Powder', 'Decoration', 'Concrete', 'blue_concrete_powder');
simple('Brown Concrete', 'Decoration', 'Concrete', 'brown_concrete');
simple('Brown Concrete Powder', 'Decoration', 'Concrete', 'brown_concrete_powder');
simple('Cyan Concrete', 'Decoration', 'Concrete', 'cyan_concrete');
simple('Cyan Concrete Powder', 'Decoration', 'Concrete', 'cyan_concrete_powder');
simple('Gray Concrete', 'Decoration', 'Concrete', 'gray_concrete');
simple('Gray Concrete Powder', 'Decoration', 'Concrete', 'gray_concrete_powder');
simple('Green Concrete', 'Decoration', 'Concrete', 'green_concrete');
simple('Green Concrete Powder', 'Decoration', 'Concrete', 'green_concrete_powder');
simple('Light Blue Concrete', 'Decoration', 'Concrete', 'light_blue_concrete');
simple('Light Blue Concrete Powder', 'Decoration', 'Concrete', 'light_blue_concrete_powder');
simple('Light Gray Concrete', 'Decoration', 'Concrete', 'light_gray_concrete');
simple('Light Gray Concrete Powder', 'Decoration', 'Concrete', 'light_gray_concrete_powder');
simple('Lime Concrete', 'Decoration', 'Concrete', 'lime_concrete');
simple('Lime Concrete Powder', 'Decoration', 'Concrete', 'lime_concrete_powder');
simple('Magenta Concrete', 'Decoration', 'Concrete', 'magenta_concrete');
simple('Magenta Concrete Powder', 'Decoration', 'Concrete', 'magenta_concrete_powder');
simple('Orange Concrete', 'Decoration', 'Concrete', 'orange_concrete');
simple('Orange Concrete Powder', 'Decoration', 'Concrete', 'orange_concrete_powder');
simple('Pink Concrete', 'Decoration', 'Concrete', 'pink_concrete');
simple('Pink Concrete Powder', 'Decoration', 'Concrete', 'pink_concrete_powder');
simple('Purple Concrete', 'Decoration', 'Concrete', 'purple_concrete');
simple('Purple Concrete Powder', 'Decoration', 'Concrete', 'purple_concrete_powder');
simple('Red Concrete', 'Decoration', 'Concrete', 'red_concrete');
simple('Red Concrete Powder', 'Decoration', 'Concrete', 'red_concrete_powder');

// --- Doors ---
unique('Acacia Door', 'Decoration', 'Doors', 'acacia_door_top', 'acacia_door_bottom', 'acacia_door_bottom');
simple('Acacia Trapdoor', 'Decoration', 'Doors', 'acacia_trapdoor');
unique('Bamboo Door', 'Decoration', 'Doors', 'bamboo_door_top', 'bamboo_door_bottom', 'bamboo_door_bottom');
simple('Bamboo Trapdoor', 'Decoration', 'Doors', 'bamboo_trapdoor');
unique('Birch Door', 'Decoration', 'Doors', 'birch_door_top', 'birch_door_bottom', 'birch_door_bottom');
simple('Birch Trapdoor', 'Decoration', 'Doors', 'birch_trapdoor');
unique('Cherry Door', 'Decoration', 'Doors', 'cherry_door_top', 'cherry_door_bottom', 'cherry_door_bottom');
simple('Cherry Trapdoor', 'Decoration', 'Doors', 'cherry_trapdoor');
unique('Crimson Door', 'Decoration', 'Doors', 'crimson_door_top', 'crimson_door_bottom', 'crimson_door_bottom');
simple('Crimson Trapdoor', 'Decoration', 'Doors', 'crimson_trapdoor');
unique('Dark Oak Door', 'Decoration', 'Doors', 'dark_oak_door_top', 'dark_oak_door_bottom', 'dark_oak_door_bottom');
simple('Dark Oak Trapdoor', 'Decoration', 'Doors', 'dark_oak_trapdoor');
unique('Jungle Door', 'Decoration', 'Doors', 'jungle_door_top', 'jungle_door_bottom', 'jungle_door_bottom');
simple('Jungle Trapdoor', 'Decoration', 'Doors', 'jungle_trapdoor');
unique('Mangrove Door', 'Decoration', 'Doors', 'mangrove_door_top', 'mangrove_door_bottom', 'mangrove_door_bottom');
simple('Mangrove Trapdoor', 'Decoration', 'Doors', 'mangrove_trapdoor');
unique('Oak Door', 'Decoration', 'Doors', 'oak_door_top', 'oak_door_bottom', 'oak_door_bottom');
simple('Oak Trapdoor', 'Decoration', 'Doors', 'oak_trapdoor');
unique('Spruce Door', 'Decoration', 'Doors', 'spruce_door_top', 'spruce_door_bottom', 'spruce_door_bottom');
simple('Spruce Trapdoor', 'Decoration', 'Doors', 'spruce_trapdoor');

// --- Glass ---
simple('Black Stained Glass', 'Decoration', 'Glass', 'black_stained_glass', true);
simple('Blue Stained Glass', 'Decoration', 'Glass', 'blue_stained_glass', true);
simple('Brown Stained Glass', 'Decoration', 'Glass', 'brown_stained_glass', true);
simple('Cyan Stained Glass', 'Decoration', 'Glass', 'cyan_stained_glass', true);
simple('Gray Stained Glass', 'Decoration', 'Glass', 'gray_stained_glass', true);
simple('Green Stained Glass', 'Decoration', 'Glass', 'green_stained_glass', true);
simple('Light Blue Stained Glass', 'Decoration', 'Glass', 'light_blue_stained_glass', true);
simple('Light Gray Stained Glass', 'Decoration', 'Glass', 'light_gray_stained_glass', true);
simple('Lime Stained Glass', 'Decoration', 'Glass', 'lime_stained_glass', true);
simple('Magenta Stained Glass', 'Decoration', 'Glass', 'magenta_stained_glass', true);
simple('Orange Stained Glass', 'Decoration', 'Glass', 'orange_stained_glass', true);
simple('Pink Stained Glass', 'Decoration', 'Glass', 'pink_stained_glass', true);
simple('Purple Stained Glass', 'Decoration', 'Glass', 'purple_stained_glass', true);
simple('Red Stained Glass', 'Decoration', 'Glass', 'red_stained_glass', true);

// --- Light ---
simple('Black Candle', 'Decoration', 'Light', 'black_candle');
simple('Blue Candle', 'Decoration', 'Light', 'blue_candle');
simple('Brown Candle', 'Decoration', 'Light', 'brown_candle');
simple('Copper Bulb', 'Decoration', 'Light', 'copper_bulb');
simple('Copper Bulb Lit Powered', 'Decoration', 'Light', 'copper_bulb_lit_powered');
simple('Copper Bulb Powered', 'Decoration', 'Light', 'copper_bulb_powered');
simple('Cyan Candle', 'Decoration', 'Light', 'cyan_candle');
simple('Exposed Copper Bulb', 'Decoration', 'Light', 'exposed_copper_bulb');
simple('Exposed Copper Bulb Lit Powered', 'Decoration', 'Light', 'exposed_copper_bulb_lit_powered');
simple('Exposed Copper Bulb Powered', 'Decoration', 'Light', 'exposed_copper_bulb_powered');
simple('Gray Candle', 'Decoration', 'Light', 'gray_candle');
simple('Green Candle', 'Decoration', 'Light', 'green_candle');
simple('Jack O Lantern', 'Decoration', 'Light', 'jack_o_lantern');
simple('Lantern', 'Decoration', 'Light', 'lantern');
simple('Light Blue Candle', 'Decoration', 'Light', 'light_blue_candle');
simple('Light Gray Candle', 'Decoration', 'Light', 'light_gray_candle');
simple('Lime Candle', 'Decoration', 'Light', 'lime_candle');
simple('Magenta Candle', 'Decoration', 'Light', 'magenta_candle');
pillar('Ochre Froglight', 'Decoration', 'Light', 'ochre_froglight_side', 'ochre_froglight_top');
simple('Orange Candle', 'Decoration', 'Light', 'orange_candle');
simple('Oxidized Copper Bulb', 'Decoration', 'Light', 'oxidized_copper_bulb');
simple('Oxidized Copper Bulb Lit Powered', 'Decoration', 'Light', 'oxidized_copper_bulb_lit_powered');
simple('Oxidized Copper Bulb Powered', 'Decoration', 'Light', 'oxidized_copper_bulb_powered');
pillar('Pearlescent Froglight', 'Decoration', 'Light', 'pearlescent_froglight_side', 'pearlescent_froglight_top');
simple('Pink Candle', 'Decoration', 'Light', 'pink_candle');
simple('Purple Candle', 'Decoration', 'Light', 'purple_candle');
simple('Red Candle', 'Decoration', 'Light', 'red_candle');
simple('Sea Lantern', 'Decoration', 'Light', 'sea_lantern');
simple('Torch', 'Decoration', 'Light', 'torch');
pillar('Verdant Froglight', 'Decoration', 'Light', 'verdant_froglight_side', 'verdant_froglight_top');

// --- Terracotta ---
simple('Black Glazed Terracotta', 'Decoration', 'Terracotta', 'black_glazed_terracotta');
simple('Black Terracotta', 'Decoration', 'Terracotta', 'black_terracotta');
simple('Blue Glazed Terracotta', 'Decoration', 'Terracotta', 'blue_glazed_terracotta');
simple('Blue Terracotta', 'Decoration', 'Terracotta', 'blue_terracotta');
simple('Brown Glazed Terracotta', 'Decoration', 'Terracotta', 'brown_glazed_terracotta');
simple('Brown Terracotta', 'Decoration', 'Terracotta', 'brown_terracotta');
simple('Cyan Glazed Terracotta', 'Decoration', 'Terracotta', 'cyan_glazed_terracotta');
simple('Cyan Terracotta', 'Decoration', 'Terracotta', 'cyan_terracotta');
simple('Gray Glazed Terracotta', 'Decoration', 'Terracotta', 'gray_glazed_terracotta');
simple('Gray Terracotta', 'Decoration', 'Terracotta', 'gray_terracotta');
simple('Green Glazed Terracotta', 'Decoration', 'Terracotta', 'green_glazed_terracotta');
simple('Green Terracotta', 'Decoration', 'Terracotta', 'green_terracotta');
simple('Light Blue Glazed Terracotta', 'Decoration', 'Terracotta', 'light_blue_glazed_terracotta');
simple('Light Blue Terracotta', 'Decoration', 'Terracotta', 'light_blue_terracotta');
simple('Light Gray Glazed Terracotta', 'Decoration', 'Terracotta', 'light_gray_glazed_terracotta');
simple('Light Gray Terracotta', 'Decoration', 'Terracotta', 'light_gray_terracotta');
simple('Lime Glazed Terracotta', 'Decoration', 'Terracotta', 'lime_glazed_terracotta');
simple('Lime Terracotta', 'Decoration', 'Terracotta', 'lime_terracotta');
simple('Magenta Glazed Terracotta', 'Decoration', 'Terracotta', 'magenta_glazed_terracotta');
simple('Magenta Terracotta', 'Decoration', 'Terracotta', 'magenta_terracotta');
simple('Orange Glazed Terracotta', 'Decoration', 'Terracotta', 'orange_glazed_terracotta');
simple('Orange Terracotta', 'Decoration', 'Terracotta', 'orange_terracotta');
simple('Pink Glazed Terracotta', 'Decoration', 'Terracotta', 'pink_glazed_terracotta');
simple('Pink Terracotta', 'Decoration', 'Terracotta', 'pink_terracotta');
simple('Purple Glazed Terracotta', 'Decoration', 'Terracotta', 'purple_glazed_terracotta');
simple('Purple Terracotta', 'Decoration', 'Terracotta', 'purple_terracotta');
simple('Red Glazed Terracotta', 'Decoration', 'Terracotta', 'red_glazed_terracotta');
simple('Red Terracotta', 'Decoration', 'Terracotta', 'red_terracotta');

// --- Utility ---
simple('Black Shulker Box', 'Decoration', 'Utility', 'black_shulker_box');
simple('Blue Shulker Box', 'Decoration', 'Utility', 'blue_shulker_box');
simple('Brown Shulker Box', 'Decoration', 'Utility', 'brown_shulker_box');
simple('Cyan Shulker Box', 'Decoration', 'Utility', 'cyan_shulker_box');
simple('Gray Shulker Box', 'Decoration', 'Utility', 'gray_shulker_box');
simple('Green Shulker Box', 'Decoration', 'Utility', 'green_shulker_box');
simple('Light Blue Shulker Box', 'Decoration', 'Utility', 'light_blue_shulker_box');
simple('Light Gray Shulker Box', 'Decoration', 'Utility', 'light_gray_shulker_box');
simple('Lime Shulker Box', 'Decoration', 'Utility', 'lime_shulker_box');
simple('Magenta Shulker Box', 'Decoration', 'Utility', 'magenta_shulker_box');
simple('Orange Shulker Box', 'Decoration', 'Utility', 'orange_shulker_box');
simple('Pink Shulker Box', 'Decoration', 'Utility', 'pink_shulker_box');
simple('Purple Shulker Box', 'Decoration', 'Utility', 'purple_shulker_box');
simple('Red Shulker Box', 'Decoration', 'Utility', 'red_shulker_box');

// --- Wool ---
simple('Black Wool', 'Decoration', 'Wool', 'black_wool');
simple('Blue Wool', 'Decoration', 'Wool', 'blue_wool');
simple('Brown Wool', 'Decoration', 'Wool', 'brown_wool');
simple('Cyan Wool', 'Decoration', 'Wool', 'cyan_wool');
simple('Gray Wool', 'Decoration', 'Wool', 'gray_wool');
simple('Green Wool', 'Decoration', 'Wool', 'green_wool');
simple('Light Blue Wool', 'Decoration', 'Wool', 'light_blue_wool');
simple('Light Gray Wool', 'Decoration', 'Wool', 'light_gray_wool');
simple('Lime Wool', 'Decoration', 'Wool', 'lime_wool');
simple('Magenta Wool', 'Decoration', 'Wool', 'magenta_wool');
simple('Orange Wool', 'Decoration', 'Wool', 'orange_wool');
simple('Pink Wool', 'Decoration', 'Wool', 'pink_wool');
simple('Purple Wool', 'Decoration', 'Wool', 'purple_wool');
simple('Red Wool', 'Decoration', 'Wool', 'red_wool');

// ========== NATURE ==========

// --- Plants ---
simple('Acacia Leaves', 'Nature', 'Plants', 'acacia_leaves', true);
simple('Acacia Sapling', 'Nature', 'Plants', 'acacia_sapling');
simple('Attached Melon Stem', 'Nature', 'Plants', 'attached_melon_stem');
simple('Attached Pumpkin Stem', 'Nature', 'Plants', 'attached_pumpkin_stem');
pillar('Azalea', 'Nature', 'Plants', 'azalea_side', 'azalea_top');
simple('Azalea Leaves', 'Nature', 'Plants', 'azalea_leaves', true);
simple('Azalea Plant', 'Nature', 'Plants', 'azalea_plant');
unique('Bamboo Block', 'Nature', 'Plants', 'bamboo_block_top', 'bamboo_block', 'bamboo_block_top');
simple('Bamboo Fence', 'Nature', 'Plants', 'bamboo_fence');
simple('Bamboo Fence Gate', 'Nature', 'Plants', 'bamboo_fence_gate');
simple('Bamboo Large Leaves', 'Nature', 'Plants', 'bamboo_large_leaves', true);
simple('Bamboo Mosaic', 'Nature', 'Plants', 'bamboo_mosaic');
simple('Bamboo Singleleaf', 'Nature', 'Plants', 'bamboo_singleleaf');
simple('Bamboo Small Leaves', 'Nature', 'Plants', 'bamboo_small_leaves', true);
simple('Bamboo Stalk', 'Nature', 'Plants', 'bamboo_stalk');
pillar('Big Dripleaf', 'Nature', 'Plants', 'big_dripleaf_side', 'big_dripleaf_top');
simple('Big Dripleaf Stem', 'Nature', 'Plants', 'big_dripleaf_stem');
simple('Big Dripleaf Tip', 'Nature', 'Plants', 'big_dripleaf_tip');
simple('Birch Leaves', 'Nature', 'Plants', 'birch_leaves', true);
simple('Birch Sapling', 'Nature', 'Plants', 'birch_sapling');
simple('Brain Coral', 'Nature', 'Plants', 'brain_coral');
simple('Brain Coral Block', 'Nature', 'Plants', 'brain_coral_block');
simple('Brain Coral Fan', 'Nature', 'Plants', 'brain_coral_fan');
simple('Bubble Coral', 'Nature', 'Plants', 'bubble_coral');
simple('Bubble Coral Block', 'Nature', 'Plants', 'bubble_coral_block');
simple('Bubble Coral Fan', 'Nature', 'Plants', 'bubble_coral_fan');
pillar('Cactus', 'Nature', 'Plants', 'cactus_side', 'cactus_top');
simple('Carved Pumpkin', 'Nature', 'Plants', 'carved_pumpkin');
simple('Cave Vines', 'Nature', 'Plants', 'cave_vines');
simple('Cave Vines Plant', 'Nature', 'Plants', 'cave_vines_plant');
simple('Cherry Leaves', 'Nature', 'Plants', 'cherry_leaves', true);
simple('Cherry Sapling', 'Nature', 'Plants', 'cherry_sapling');
simple('Cornflower', 'Nature', 'Plants', 'cornflower');
simple('Dandelion', 'Nature', 'Plants', 'dandelion');
simple('Dark Oak Leaves', 'Nature', 'Plants', 'dark_oak_leaves', true);
simple('Dark Oak Sapling', 'Nature', 'Plants', 'dark_oak_sapling');
simple('Dead Brain Coral', 'Nature', 'Plants', 'dead_brain_coral');
simple('Dead Brain Coral Block', 'Nature', 'Plants', 'dead_brain_coral_block');
simple('Dead Brain Coral Fan', 'Nature', 'Plants', 'dead_brain_coral_fan');
simple('Dead Bubble Coral', 'Nature', 'Plants', 'dead_bubble_coral');
simple('Dead Bubble Coral Block', 'Nature', 'Plants', 'dead_bubble_coral_block');
simple('Dead Bubble Coral Fan', 'Nature', 'Plants', 'dead_bubble_coral_fan');
simple('Dead Bush', 'Nature', 'Plants', 'dead_bush');
simple('Dead Fire Coral', 'Nature', 'Plants', 'dead_fire_coral');
simple('Dead Fire Coral Block', 'Nature', 'Plants', 'dead_fire_coral_block');
simple('Dead Fire Coral Fan', 'Nature', 'Plants', 'dead_fire_coral_fan');
simple('Dead Horn Coral', 'Nature', 'Plants', 'dead_horn_coral');
simple('Dead Horn Coral Block', 'Nature', 'Plants', 'dead_horn_coral_block');
simple('Dead Horn Coral Fan', 'Nature', 'Plants', 'dead_horn_coral_fan');
simple('Dead Tube Coral', 'Nature', 'Plants', 'dead_tube_coral');
simple('Dead Tube Coral Block', 'Nature', 'Plants', 'dead_tube_coral_block');
simple('Dead Tube Coral Fan', 'Nature', 'Plants', 'dead_tube_coral_fan');
pillar('Dried Kelp', 'Nature', 'Plants', 'dried_kelp_side', 'dried_kelp_top');
simple('Fern', 'Nature', 'Plants', 'fern');
simple('Fire Coral', 'Nature', 'Plants', 'fire_coral');
simple('Fire Coral Block', 'Nature', 'Plants', 'fire_coral_block');
simple('Fire Coral Fan', 'Nature', 'Plants', 'fire_coral_fan');
simple('Flower Pot', 'Nature', 'Plants', 'flower_pot');
pillar('Flowering Azalea', 'Nature', 'Plants', 'flowering_azalea_side', 'flowering_azalea_top');
simple('Flowering Azalea Leaves', 'Nature', 'Plants', 'flowering_azalea_leaves', true);
simple('Horn Coral', 'Nature', 'Plants', 'horn_coral');
simple('Horn Coral Block', 'Nature', 'Plants', 'horn_coral_block');
simple('Horn Coral Fan', 'Nature', 'Plants', 'horn_coral_fan');
simple('Jungle Leaves', 'Nature', 'Plants', 'jungle_leaves', true);
simple('Jungle Sapling', 'Nature', 'Plants', 'jungle_sapling');
simple('Kelp', 'Nature', 'Plants', 'kelp');
simple('Kelp Plant', 'Nature', 'Plants', 'kelp_plant');
unique('Large Fern', 'Nature', 'Plants', 'large_fern_top', 'large_fern_bottom', 'large_fern_bottom');
simple('Lily Of The Valley', 'Nature', 'Plants', 'lily_of_the_valley');
simple('Lily Pad', 'Nature', 'Plants', 'lily_pad');
simple('Mangrove Leaves', 'Nature', 'Plants', 'mangrove_leaves', true);
pillar('Melon', 'Nature', 'Plants', 'melon_side', 'melon_top');
simple('Melon Stem', 'Nature', 'Plants', 'melon_stem');
simple('Mushroom Block Inside', 'Nature', 'Plants', 'mushroom_block_inside');
simple('Mushroom Stem', 'Nature', 'Plants', 'mushroom_stem');
simple('Oak Leaves', 'Nature', 'Plants', 'oak_leaves', true);
simple('Oak Sapling', 'Nature', 'Plants', 'oak_sapling');
simple('Poppy', 'Nature', 'Plants', 'poppy');
pillar('Potted Azalea Bush', 'Nature', 'Plants', 'potted_azalea_bush_side', 'potted_azalea_bush_top');
simple('Potted Azalea Bush Plant', 'Nature', 'Plants', 'potted_azalea_bush_plant');
pillar('Pumpkin', 'Nature', 'Plants', 'pumpkin_side', 'pumpkin_top');
simple('Pumpkin Stem', 'Nature', 'Plants', 'pumpkin_stem');
unique('Rose Bush', 'Nature', 'Plants', 'rose_bush_top', 'rose_bush_bottom', 'rose_bush_bottom');
pillar('Small Dripleaf', 'Nature', 'Plants', 'small_dripleaf_side', 'small_dripleaf_top');
unique('Small Dripleaf Stem', 'Nature', 'Plants', 'small_dripleaf_stem_top', 'small_dripleaf_stem_bottom', 'small_dripleaf_stem_bottom');
simple('Spore Blossom', 'Nature', 'Plants', 'spore_blossom');
simple('Spore Blossom Base', 'Nature', 'Plants', 'spore_blossom_base');
simple('Spruce Leaves', 'Nature', 'Plants', 'spruce_leaves', true);
simple('Spruce Sapling', 'Nature', 'Plants', 'spruce_sapling');
unique('Stripped Bamboo Block', 'Nature', 'Plants', 'stripped_bamboo_block_top', 'stripped_bamboo_block', 'stripped_bamboo_block_top');
directional('Sunflower', 'Nature', 'Plants', 'sunflower_top', 'sunflower_back', 'sunflower_front', 'sunflower_bottom');
simple('Torchflower', 'Nature', 'Plants', 'torchflower');
simple('Tube Coral', 'Nature', 'Plants', 'tube_coral');
simple('Tube Coral Block', 'Nature', 'Plants', 'tube_coral_block');
simple('Tube Coral Fan', 'Nature', 'Plants', 'tube_coral_fan');
simple('Twisting Vines', 'Nature', 'Plants', 'twisting_vines');
simple('Twisting Vines Plant', 'Nature', 'Plants', 'twisting_vines_plant');
simple('Vine', 'Nature', 'Plants', 'vine');

// --- Sculk ---
simple('Calibrated Sculk Sensor Amethyst', 'Nature', 'Sculk', 'calibrated_sculk_sensor_amethyst');
simple('Sculk', 'Nature', 'Sculk', 'sculk');
pillar('Sculk Catalyst', 'Nature', 'Sculk', 'sculk_catalyst_side', 'sculk_catalyst_top');
pillar('Sculk Sensor', 'Nature', 'Sculk', 'sculk_sensor_side', 'sculk_sensor_top');
simple('Sculk Sensor Tendril Active', 'Nature', 'Sculk', 'sculk_sensor_tendril_active');
simple('Sculk Sensor Tendril Inactive', 'Nature', 'Sculk', 'sculk_sensor_tendril_inactive');
pillar('Sculk Shrieker', 'Nature', 'Sculk', 'sculk_shrieker_side', 'sculk_shrieker_top');
simple('Sculk Vein', 'Nature', 'Sculk', 'sculk_vein');

// --- Terrain ---
simple('Clay', 'Nature', 'Terrain', 'clay');
simple('Coarse Dirt', 'Nature', 'Terrain', 'coarse_dirt');
simple('Dirt', 'Nature', 'Terrain', 'dirt');
pillar('Dirt Path', 'Nature', 'Terrain', 'dirt_path_side', 'dirt_path_top');
pillar('Grass Block', 'Nature', 'Terrain', 'grass_block_side', 'grass_block_top');
simple('Grass Block Snow', 'Nature', 'Terrain', 'grass_block_snow');
simple('Gravel', 'Nature', 'Terrain', 'gravel');
simple('Ice', 'Nature', 'Terrain', 'ice', true);
simple('Moss Block', 'Nature', 'Terrain', 'moss_block');
simple('Mud', 'Nature', 'Terrain', 'mud');
simple('Mud Bricks', 'Nature', 'Terrain', 'mud_bricks');
pillar('Muddy Mangrove Roots', 'Nature', 'Terrain', 'muddy_mangrove_roots_side', 'muddy_mangrove_roots_top');
pillar('Mycelium', 'Nature', 'Terrain', 'mycelium_side', 'mycelium_top');
simple('Packed Ice', 'Nature', 'Terrain', 'packed_ice', true);
simple('Packed Mud', 'Nature', 'Terrain', 'packed_mud');
pillar('Podzol', 'Nature', 'Terrain', 'podzol_side', 'podzol_top');
simple('Powder Snow', 'Nature', 'Terrain', 'powder_snow');
simple('Rooted Dirt', 'Nature', 'Terrain', 'rooted_dirt');
simple('Sand', 'Nature', 'Terrain', 'sand');
simple('Seagrass', 'Nature', 'Terrain', 'seagrass');
simple('Short Grass', 'Nature', 'Terrain', 'short_grass');
simple('Snow', 'Nature', 'Terrain', 'snow');
simple('Suspicious Gravel 0', 'Nature', 'Terrain', 'suspicious_gravel_0');
simple('Suspicious Gravel 1', 'Nature', 'Terrain', 'suspicious_gravel_1');
simple('Suspicious Gravel 2', 'Nature', 'Terrain', 'suspicious_gravel_2');
simple('Suspicious Gravel 3', 'Nature', 'Terrain', 'suspicious_gravel_3');
simple('Suspicious Sand 0', 'Nature', 'Terrain', 'suspicious_sand_0');
simple('Suspicious Sand 1', 'Nature', 'Terrain', 'suspicious_sand_1');
simple('Suspicious Sand 2', 'Nature', 'Terrain', 'suspicious_sand_2');
simple('Suspicious Sand 3', 'Nature', 'Terrain', 'suspicious_sand_3');
unique('Tall Grass', 'Nature', 'Terrain', 'tall_grass_top', 'tall_grass_bottom', 'tall_grass_bottom');
unique('Tall Seagrass', 'Nature', 'Terrain', 'tall_seagrass_top', 'tall_seagrass_bottom', 'tall_seagrass_bottom');

// ========== NETHER ==========

// --- Terrain ---
pillar('Basalt', 'Nether', 'Terrain', 'basalt_side', 'basalt_top');
simple('Chiseled Nether Bricks', 'Nether', 'Terrain', 'chiseled_nether_bricks');
simple('Cracked Nether Bricks', 'Nether', 'Terrain', 'cracked_nether_bricks');
simple('Crimson Fungus', 'Nether', 'Terrain', 'crimson_fungus');
unique('Crimson Nylium', 'Nether', 'Terrain', 'crimson_nylium', 'crimson_nylium_side', 'crimson_nylium');
simple('Crimson Roots', 'Nether', 'Terrain', 'crimson_roots');
simple('Crimson Roots Pot', 'Nether', 'Terrain', 'crimson_roots_pot');
simple('Magma', 'Nether', 'Terrain', 'magma');
simple('Nether Bricks', 'Nether', 'Terrain', 'nether_bricks');
simple('Nether Portal', 'Nether', 'Terrain', 'nether_portal');
simple('Nether Sprouts', 'Nether', 'Terrain', 'nether_sprouts');
simple('Nether Wart Block', 'Nether', 'Terrain', 'nether_wart_block');
simple('Netherrack', 'Nether', 'Terrain', 'netherrack');
pillar('Polished Basalt', 'Nether', 'Terrain', 'polished_basalt_side', 'polished_basalt_top');
simple('Shroomlight', 'Nether', 'Terrain', 'shroomlight');
simple('Smooth Basalt', 'Nether', 'Terrain', 'smooth_basalt');
simple('Soul Campfire Fire', 'Nether', 'Terrain', 'soul_campfire_fire');
simple('Soul Campfire Log', 'Nether', 'Terrain', 'soul_campfire_log_lit');
simple('Soul Fire 0', 'Nether', 'Terrain', 'soul_fire_0');
simple('Soul Fire 1', 'Nether', 'Terrain', 'soul_fire_1');
simple('Soul Lantern', 'Nether', 'Terrain', 'soul_lantern');
simple('Soul Sand', 'Nether', 'Terrain', 'soul_sand');
simple('Soul Soil', 'Nether', 'Terrain', 'soul_soil');
simple('Soul Torch', 'Nether', 'Terrain', 'soul_torch');
unique('Stripped Crimson Stem', 'Nether', 'Terrain', 'stripped_crimson_stem_top', 'stripped_crimson_stem', 'stripped_crimson_stem_top');
unique('Stripped Warped Stem', 'Nether', 'Terrain', 'stripped_warped_stem_top', 'stripped_warped_stem', 'stripped_warped_stem_top');

// ========== REDSTONE ==========

// --- Mechanics ---
directional('Chain Command Block', 'Redstone', 'Mechanics', 'chain_command_block_back', 'chain_command_block_side', 'chain_command_block_front');
simple('Chain Command Block Conditional', 'Redstone', 'Mechanics', 'chain_command_block_conditional', true);
directional('Command Block', 'Redstone', 'Mechanics', 'command_block_back', 'command_block_side', 'command_block_front');
simple('Command Block Conditional', 'Redstone', 'Mechanics', 'command_block_conditional');
simple('Comparator', 'Redstone', 'Mechanics', 'comparator');
simple('Dispenser Front Vertical', 'Redstone', 'Mechanics', 'dispenser_front_vertical');
simple('Dropper Front Vertical', 'Redstone', 'Mechanics', 'dropper_front_vertical');
simple('Hopper Inside', 'Redstone', 'Mechanics', 'hopper_inside');
simple('Hopper Outside', 'Redstone', 'Mechanics', 'hopper_outside');
simple('Lever', 'Redstone', 'Mechanics', 'lever');
pillar('Observer', 'Redstone', 'Mechanics', 'observer_side', 'observer_top');
simple('Observer Back', 'Redstone', 'Mechanics', 'observer_back_on');
pillar('Piston', 'Redstone', 'Mechanics', 'piston_side', 'piston_top');
simple('Piston Top Sticky', 'Redstone', 'Mechanics', 'piston_top_sticky');
simple('Repeater', 'Redstone', 'Mechanics', 'repeater');
directional('Repeating Command Block', 'Redstone', 'Mechanics', 'repeating_command_block_back', 'repeating_command_block_side', 'repeating_command_block_front');
simple('Repeating Command Block Conditional', 'Redstone', 'Mechanics', 'repeating_command_block_conditional');
pillar('Target', 'Redstone', 'Mechanics', 'target_side', 'target_top');

// ========== UTILITY ==========

// --- Workstations ---
unique('Anvil', 'Utility', 'Workstations', 'anvil_top', 'anvil', 'anvil_top');
pillar('Barrel', 'Utility', 'Workstations', 'barrel_side', 'barrel_top');
simple('Barrel Top', 'Utility', 'Workstations', 'barrel_top_open');
simple('Beacon', 'Utility', 'Workstations', 'beacon');
pillar('Blast Furnace', 'Utility', 'Workstations', 'blast_furnace_side', 'blast_furnace_top');
simple('Blast Furnace Front', 'Utility', 'Workstations', 'blast_furnace_front_on');
simple('Brewing Stand', 'Utility', 'Workstations', 'brewing_stand');
simple('Brewing Stand Base', 'Utility', 'Workstations', 'brewing_stand_base');
simple('Cartography Table Side1', 'Utility', 'Workstations', 'cartography_table_side1');
simple('Cartography Table Side2', 'Utility', 'Workstations', 'cartography_table_side2');
simple('Cartography Table Side3', 'Utility', 'Workstations', 'cartography_table_side3');
pillar('Cauldron', 'Utility', 'Workstations', 'cauldron_side', 'cauldron_top');
pillar('Composter', 'Utility', 'Workstations', 'composter_side', 'composter_top');
simple('Composter Compost', 'Utility', 'Workstations', 'composter_compost');
simple('Composter Ready', 'Utility', 'Workstations', 'composter_ready');
simple('Crafter East Crafting', 'Utility', 'Workstations', 'crafter_east_crafting');
simple('Crafter North Crafting', 'Utility', 'Workstations', 'crafter_north_crafting');
simple('Crafter Top Crafting', 'Utility', 'Workstations', 'crafter_top_crafting');
simple('Crafter West Crafting', 'Utility', 'Workstations', 'crafter_west_crafting');
pillar('Crafting Table', 'Utility', 'Workstations', 'crafting_table_side', 'crafting_table_top');
pillar('Enchanting Table', 'Utility', 'Workstations', 'enchanting_table_side', 'enchanting_table_top');
pillar('Fletching Table', 'Utility', 'Workstations', 'fletching_table_side', 'fletching_table_top');
pillar('Furnace', 'Utility', 'Workstations', 'furnace_side', 'furnace_top');
simple('Furnace Front', 'Utility', 'Workstations', 'furnace_front_on');
directional('Lectern', 'Utility', 'Workstations', 'lectern_top', 'lectern_front', 'lectern_front');
simple('Lectern Base', 'Utility', 'Workstations', 'lectern_base');
simple('Lectern Sides', 'Utility', 'Workstations', 'lectern_sides');
pillar('Loom', 'Utility', 'Workstations', 'loom_side', 'loom_top');
unique('Respawn Anchor', 'Utility', 'Workstations', 'respawn_anchor_top', 'respawn_anchor_bottom', 'respawn_anchor_bottom');
simple('Respawn Anchor Side0', 'Utility', 'Workstations', 'respawn_anchor_side0');
simple('Respawn Anchor Side1', 'Utility', 'Workstations', 'respawn_anchor_side1');
simple('Respawn Anchor Side2', 'Utility', 'Workstations', 'respawn_anchor_side2');
simple('Respawn Anchor Side3', 'Utility', 'Workstations', 'respawn_anchor_side3');
simple('Respawn Anchor Side4', 'Utility', 'Workstations', 'respawn_anchor_side4');
simple('Respawn Anchor Top Off', 'Utility', 'Workstations', 'respawn_anchor_top_off');
simple('Sculk Catalyst Side Bloom', 'Utility', 'Workstations', 'sculk_catalyst_side_bloom');
simple('Sculk Catalyst Top Bloom', 'Utility', 'Workstations', 'sculk_catalyst_top_bloom');
pillar('Smithing Table', 'Utility', 'Workstations', 'smithing_table_side', 'smithing_table_top');
pillar('Smoker', 'Utility', 'Workstations', 'smoker_side', 'smoker_top');
simple('Smoker Front', 'Utility', 'Workstations', 'smoker_front_on');

// ========== ENTITIES ==========
// Entity paths must match the actual texture file paths
const entity = (name: string, category: string, path: string) => register({
    name,
    group: 'Entities',
    category,
    textures: {
        top: `${name}_entity`,
        bottom: `${name}_entity`,
        side: path,
        front: `${name}_entity`,
        back: `${name}_entity`,
        left: `${name}_entity`,
        right: `${name}_entity`
    },
    transparent: false
});

const ENTITY_DEFS: [string, string, string][] = [
    // Passive mobs - paths match default Minecraft assets structure
    ['Cow', 'Passive', 'cow/cow'],
    ['Pig', 'Passive', 'pig/pig'],
    ['Sheep', 'Passive', 'sheep/sheep'],
    ['Chicken', 'Passive', 'chicken'],
    ['Horse', 'Passive', 'horse/horse_brown'],
    ['Wolf', 'Passive', 'wolf/wolf'],
    ['Cat', 'Passive', 'cat/black'],
    ['Rabbit', 'Passive', 'rabbit/brown'],
    ['Fox', 'Passive', 'fox/fox'],
    ['Bee', 'Passive', 'bee/bee'],
    ['Axolotl', 'Passive', 'axolotl/axolotl_lucy'],
    ['Frog', 'Passive', 'frog/temperate_frog'],
    ['Sniffer', 'Passive', 'sniffer/sniffer'],
    ['Armadillo', 'Passive', 'armadillo'],
    ['Bat', 'Passive', 'bat'],
    ['Parrot', 'Passive', 'parrot/parrot_blue'],
    ['Turtle', 'Passive', 'turtle/big_sea_turtle'],
    ['Dolphin', 'Passive', 'dolphin'],
    ['Squid', 'Passive', 'squid/squid'],
    ['Glow Squid', 'Passive', 'squid/glow_squid'],
    ['Strider', 'Passive', 'strider/strider'],
    ['Allay', 'Passive', 'allay/allay'],
    ['Camel', 'Passive', 'camel/camel'],

    // Hostile mobs
    ['Zombie', 'Hostile', 'zombie/zombie'],
    ['Skeleton', 'Hostile', 'skeleton/skeleton'],
    ['Creeper', 'Hostile', 'creeper/creeper'],
    ['Spider', 'Hostile', 'spider/spider'],
    ['Cave Spider', 'Hostile', 'spider/cave_spider'],
    ['Enderman', 'Hostile', 'enderman/enderman'],
    ['Blaze', 'Hostile', 'blaze'],
    ['Ghast', 'Hostile', 'ghast/ghast'],
    ['Wither Skeleton', 'Hostile', 'skeleton/wither_skeleton'],
    ['Piglin', 'Hostile', 'piglin/piglin'],
    ['Piglin Brute', 'Hostile', 'piglin/piglin_brute'],
    ['Hoglin', 'Hostile', 'hoglin/hoglin'],
    ['Zoglin', 'Hostile', 'hoglin/zoglin'],
    ['Warden', 'Hostile', 'warden/warden'],
    ['Slime', 'Hostile', 'slime/slime'],
    ['Magma Cube', 'Hostile', 'slime/magmacube'],
    ['Phantom', 'Hostile', 'phantom'],
    ['Drowned', 'Hostile', 'zombie/drowned'],
    ['Husk', 'Hostile', 'zombie/husk'],
    ['Stray', 'Hostile', 'skeleton/stray'],
    ['Witch', 'Hostile', 'witch'],
    ['Vindicator', 'Hostile', 'illager/vindicator'],
    ['Evoker', 'Hostile', 'illager/evoker'],
    ['Pillager', 'Hostile', 'illager/pillager'],
    ['Ravager', 'Hostile', 'illager/ravager'],
    ['Guardian', 'Hostile', 'guardian'],
    ['Elder Guardian', 'Hostile', 'guardian_elder'],
    ['Shulker', 'Hostile', 'shulker/shulker'],
    ['Endermite', 'Hostile', 'endermite'],
    ['Silverfish', 'Hostile', 'silverfish'],
    ['Breeze', 'Hostile', 'breeze/breeze'],

    // Villagers
    ['Villager', 'Villager', 'villager/villager'],
    ['Wandering Trader', 'Villager', 'wandering_trader'],
    ['Iron Golem', 'Villager', 'iron_golem/iron_golem'],
    ['Snow Golem', 'Villager', 'snow_golem'],

    // Bosses
    ['Ender Dragon', 'Boss', 'enderdragon/dragon'],
    ['Wither', 'Boss', 'wither/wither'],
];

ENTITY_DEFS.forEach(([name, category, path]) => entity(name, category, path));

// ========== EXPORTS ==========

export const registerCustomBlock = (def: BlockDef) => {
    BLOCKS[def.id] = def;
};

export const getNextBlockId = (): number => {
    const ids = Object.keys(BLOCKS).map(Number).filter(id => id >= 1000);
    if (ids.length === 0) return 1000;
    return Math.max(...ids) + 1;
};

export const getBlockCount = (): number => Object.keys(BLOCKS).length;
