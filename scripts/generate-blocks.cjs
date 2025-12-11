#!/usr/bin/env node
// Script to generate blocks.ts from downloaded Minecraft textures

const fs = require('fs');
const path = require('path');

const TEXTURES_DIR = path.join(__dirname, '..', 'public', 'minecraft', 'textures', 'block');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'generated-blocks.ts');

// Get all texture names
const textureFiles = fs.readdirSync(TEXTURES_DIR)
    .filter(f => f.endsWith('.png'))
    .map(f => f.replace('.png', ''));

console.log(`Found ${textureFiles.length} textures`);

// Categorization rules
const categories = {
    // Wood types
    wood: ['oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'mangrove', 'cherry', 'bamboo', 'crimson', 'warped', 'pale_oak'],
    // Colors
    colors: ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'],
    // Ores
    ores: ['coal_ore', 'iron_ore', 'copper_ore', 'gold_ore', 'redstone_ore', 'emerald_ore', 'lapis_ore', 'diamond_ore', 'nether_gold_ore', 'nether_quartz_ore', 'ancient_debris'],
    // Stone types
    stone: ['stone', 'cobblestone', 'granite', 'diorite', 'andesite', 'deepslate', 'tuff', 'calcite', 'dripstone'],
};

// Block patterns to detect block types from texture names
const patterns = {
    // Pillars/logs have _top suffix
    pillar: /_log_top|_stem_top|_block_top|_pillar_top|basalt_top|quartz_block_top|bone_block_top/,
    // Simple blocks have single texture
    simple: /^[a-z_]+$/,
    // Directional blocks have multiple faces
    directional: /_top|_bottom|_side|_front|_back|_end/,
};

// Group textures by base name
function groupTextures() {
    const groups = {};

    for (const tex of textureFiles) {
        // Skip non-block textures
        if (tex.includes('_stage') || tex.includes('destroy_stage') ||
            tex.includes('_particle') || tex.includes('debug') ||
            tex.includes('_inner') || tex.includes('_overlay') ||
            tex.includes('_flow') || tex.includes('_still') ||
            tex.includes('pane_top') || tex.includes('_dust_') ||
            tex.includes('frosted_ice')) {
            continue;
        }

        // Extract base name by removing common suffixes
        let baseName = tex
            .replace(/_top$/, '')
            .replace(/_bottom$/, '')
            .replace(/_side$/, '')
            .replace(/_front$/, '')
            .replace(/_back$/, '')
            .replace(/_end$/, '')
            .replace(/_on$/, '')
            .replace(/_lit$/, '')
            .replace(/_open$/, '');

        if (!groups[baseName]) {
            groups[baseName] = { textures: [] };
        }
        groups[baseName].textures.push(tex);
    }

    return groups;
}

// Determine block category
function getCategory(baseName) {
    // Wood
    for (const wood of categories.wood) {
        if (baseName.startsWith(wood + '_')) {
            if (baseName.includes('_log') || baseName.includes('_stem') || baseName.includes('_planks')) {
                return { group: 'Building', category: 'Wood' };
            }
            if (baseName.includes('_leaves')) {
                return { group: 'Nature', category: 'Plants' };
            }
            if (baseName.includes('_door') || baseName.includes('_trapdoor')) {
                return { group: 'Decoration', category: 'Doors' };
            }
            if (baseName.includes('_sapling')) {
                return { group: 'Nature', category: 'Plants' };
            }
        }
    }

    // Colored blocks
    for (const color of categories.colors) {
        if (baseName.startsWith(color + '_')) {
            if (baseName.includes('wool')) return { group: 'Decoration', category: 'Wool' };
            if (baseName.includes('concrete')) return { group: 'Decoration', category: 'Concrete' };
            if (baseName.includes('terracotta')) return { group: 'Decoration', category: 'Terracotta' };
            if (baseName.includes('glass')) return { group: 'Decoration', category: 'Glass' };
            if (baseName.includes('shulker')) return { group: 'Decoration', category: 'Utility' };
            if (baseName.includes('candle')) return { group: 'Decoration', category: 'Light' };
            if (baseName.includes('bed')) return { group: 'Decoration', category: 'Furniture' };
            if (baseName.includes('carpet')) return { group: 'Decoration', category: 'Carpet' };
            if (baseName.includes('banner')) return { group: 'Decoration', category: 'Banners' };
            return { group: 'Decoration', category: 'Colored' };
        }
    }

    // Ores
    if (baseName.includes('_ore') || baseName === 'ancient_debris') {
        return { group: 'Building', category: 'Ores' };
    }

    // Mineral blocks
    if (baseName.includes('_block') && (
        baseName.includes('iron') || baseName.includes('gold') || baseName.includes('diamond') ||
        baseName.includes('emerald') || baseName.includes('lapis') || baseName.includes('coal') ||
        baseName.includes('copper') || baseName.includes('netherite') || baseName.includes('redstone') ||
        baseName.includes('amethyst') || baseName.includes('raw_')
    )) {
        return { group: 'Building', category: 'Mineral' };
    }

    // Stone variants
    if (baseName.includes('stone') || baseName.includes('cobblestone') ||
        baseName.includes('granite') || baseName.includes('diorite') ||
        baseName.includes('andesite') || baseName.includes('deepslate') ||
        baseName.includes('tuff') || baseName.includes('calcite')) {
        return { group: 'Building', category: 'Stone' };
    }

    // Nether
    if (baseName.includes('nether') || baseName.includes('soul') ||
        baseName.includes('basalt') || baseName.includes('blackstone') ||
        baseName.includes('crimson') || baseName.includes('warped') ||
        baseName.includes('shroomlight') || baseName.includes('magma') ||
        baseName.includes('glowstone')) {
        return { group: 'Nether', category: 'Terrain' };
    }

    // End
    if (baseName.includes('end_') || baseName.includes('purpur') || baseName.includes('chorus')) {
        return { group: 'Building', category: 'End' };
    }

    // Redstone
    if (baseName.includes('redstone') || baseName.includes('piston') ||
        baseName.includes('observer') || baseName.includes('dispenser') ||
        baseName.includes('dropper') || baseName.includes('hopper') ||
        baseName.includes('comparator') || baseName.includes('repeater') ||
        baseName.includes('target') || baseName.includes('lever') ||
        baseName.includes('command_block')) {
        return { group: 'Redstone', category: 'Mechanics' };
    }

    // Nature/Terrain
    if (baseName.includes('grass') || baseName.includes('dirt') ||
        baseName.includes('sand') || baseName.includes('gravel') ||
        baseName.includes('clay') || baseName.includes('mud') ||
        baseName.includes('snow') || baseName.includes('ice') ||
        baseName.includes('podzol') || baseName.includes('mycelium') ||
        baseName.includes('moss')) {
        return { group: 'Nature', category: 'Terrain' };
    }

    // Plants
    if (baseName.includes('flower') || baseName.includes('tulip') ||
        baseName.includes('dandelion') || baseName.includes('poppy') ||
        baseName.includes('rose') || baseName.includes('lily') ||
        baseName.includes('fern') || baseName.includes('bush') ||
        baseName.includes('vine') || baseName.includes('kelp') ||
        baseName.includes('seagrass') || baseName.includes('coral') ||
        baseName.includes('mushroom') || baseName.includes('pumpkin') ||
        baseName.includes('melon') || baseName.includes('cactus') ||
        baseName.includes('bamboo') || baseName.includes('azalea') ||
        baseName.includes('dripleaf') || baseName.includes('spore')) {
        return { group: 'Nature', category: 'Plants' };
    }

    // Utility blocks
    if (baseName.includes('crafting') || baseName.includes('furnace') ||
        baseName.includes('smoker') || baseName.includes('barrel') ||
        baseName.includes('chest') || baseName.includes('anvil') ||
        baseName.includes('enchanting') || baseName.includes('brewing') ||
        baseName.includes('grindstone') || baseName.includes('loom') ||
        baseName.includes('cartography') || baseName.includes('fletching') ||
        baseName.includes('smithing') || baseName.includes('stonecutter') ||
        baseName.includes('lectern') || baseName.includes('composter') ||
        baseName.includes('cauldron') || baseName.includes('beacon') ||
        baseName.includes('respawn_anchor') || baseName.includes('lodestone')) {
        return { group: 'Utility', category: 'Workstations' };
    }

    // Light sources
    if (baseName.includes('lantern') || baseName.includes('torch') ||
        baseName.includes('lamp') || baseName.includes('sea_lantern') ||
        baseName.includes('froglight') || baseName.includes('_bulb')) {
        return { group: 'Decoration', category: 'Light' };
    }

    // Prismarine/Ocean
    if (baseName.includes('prismarine') || baseName.includes('sea_') ||
        baseName.includes('sponge') || baseName.includes('conduit')) {
        return { group: 'Building', category: 'Ocean' };
    }

    // Sculk
    if (baseName.includes('sculk')) {
        return { group: 'Nature', category: 'Sculk' };
    }

    // Copper variants
    if (baseName.includes('copper') || baseName.includes('exposed_') ||
        baseName.includes('weathered_') || baseName.includes('oxidized_')) {
        return { group: 'Building', category: 'Copper' };
    }

    // Default
    return { group: 'Building', category: 'Misc' };
}

// Build block definition
function buildBlockDef(baseName, textures) {
    const { group, category } = getCategory(baseName);

    // Find textures for each face
    const hasTop = textures.some(t => t.endsWith('_top') || t.endsWith('_end'));
    const hasBottom = textures.some(t => t.endsWith('_bottom'));
    const hasSide = textures.some(t => t.endsWith('_side'));
    const hasFront = textures.some(t => t.endsWith('_front'));
    const hasBack = textures.some(t => t.endsWith('_back'));

    const topTex = textures.find(t => t.endsWith('_top') || t.endsWith('_end')) || textures[0];
    const bottomTex = textures.find(t => t.endsWith('_bottom')) || topTex;
    const sideTex = textures.find(t => t.endsWith('_side')) || textures.find(t => !t.endsWith('_top') && !t.endsWith('_bottom')) || textures[0];
    const frontTex = textures.find(t => t.endsWith('_front')) || sideTex;

    // Determine block type
    let blockType = 'simple';
    if (hasTop && hasSide && topTex !== sideTex) {
        blockType = 'pillar';
    } else if (hasFront) {
        blockType = 'directional';
    }

    // Format name
    const displayName = baseName
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    // Check for transparency
    const transparent = baseName.includes('glass') || baseName.includes('leaves') ||
        baseName.includes('ice') || baseName.includes('slime') ||
        baseName.includes('honey') || baseName.includes('_bars') ||
        baseName.includes('chain');

    return {
        name: displayName,
        group,
        category,
        textures: {
            top: topTex,
            side: sideTex,
            bottom: bottomTex,
            front: hasFront ? frontTex : undefined,
        },
        transparent,
        blockType
    };
}

// Generate TypeScript output
function generateTS() {
    const groups = groupTextures();
    const blocks = [];

    for (const [baseName, data] of Object.entries(groups)) {
        // Skip if only one texture that looks like a part (not a full block)
        if (data.textures.length === 1) {
            const tex = data.textures[0];
            // Skip partial textures
            if (tex.endsWith('_top') || tex.endsWith('_bottom') ||
                tex.endsWith('_side') || tex.endsWith('_front') ||
                tex.endsWith('_back') || tex.endsWith('_end') ||
                tex.endsWith('_inner') || tex.endsWith('_outer')) {
                continue;
            }
        }

        const block = buildBlockDef(baseName, data.textures);
        blocks.push({ baseName, ...block });
    }

    // Sort by category
    blocks.sort((a, b) => {
        if (a.group !== b.group) return a.group.localeCompare(b.group);
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.name.localeCompare(b.name);
    });

    // Generate TypeScript
    let output = `// Auto-generated Minecraft block definitions
// Generated from ${textureFiles.length} textures

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

`;

    let currentGroup = '';
    let currentCategory = '';

    for (const block of blocks) {
        if (block.group !== currentGroup) {
            output += `\n// ========== ${block.group.toUpperCase()} ==========\n`;
            currentGroup = block.group;
            currentCategory = '';
        }
        if (block.category !== currentCategory) {
            output += `\n// --- ${block.category} ---\n`;
            currentCategory = block.category;
        }

        const { name, group, category, textures, transparent, blockType } = block;

        if (blockType === 'pillar' && textures.top !== textures.side) {
            output += `pillar('${name}', '${group}', '${category}', '${textures.side}', '${textures.top}');\n`;
        } else if (blockType === 'directional' && textures.front) {
            output += `directional('${name}', '${group}', '${category}', '${textures.top}', '${textures.side}', '${textures.front}'`;
            if (textures.bottom !== textures.top) output += `, '${textures.bottom}'`;
            output += `);\n`;
        } else if (textures.top !== textures.side || textures.bottom !== textures.top) {
            output += `unique('${name}', '${group}', '${category}', '${textures.top}', '${textures.side}', '${textures.bottom}'`;
            if (transparent) output += `, true`;
            output += `);\n`;
        } else {
            output += `simple('${name}', '${group}', '${category}', '${textures.top}'`;
            if (transparent) output += `, true`;
            output += `);\n`;
        }
    }

    output += `
// ========== ENTITIES ==========
// Entity paths must match the actual texture file paths
const entity = (name: string, category: string, path: string) => register({
    name,
    group: 'Entities',
    category,
    textures: {
        top: \`\${name}_entity\`,
        bottom: \`\${name}_entity\`,
        side: path,
        front: \`\${name}_entity\`,
        back: \`\${name}_entity\`,
        left: \`\${name}_entity\`,
        right: \`\${name}_entity\`
    },
    transparent: false
});

const ENTITY_DEFS: [string, string, string][] = [
    // Passive mobs
    ['Cow', 'Passive', 'cow/temperate_cow'],
    ['Pig', 'Passive', 'pig/temperate_pig'],
    ['Sheep', 'Passive', 'sheep/sheep'],
    ['Chicken', 'Passive', 'chicken/chicken'],
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
`;

    // Create src directory if needed
    const srcDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`\nGenerated ${blocks.length} block definitions to ${OUTPUT_FILE}`);
}

generateTS();
