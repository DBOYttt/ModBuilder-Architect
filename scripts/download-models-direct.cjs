#!/usr/bin/env node
// Script to download Minecraft block models directly (no API)

const fs = require('fs');
const path = require('path');
const https = require('https');

const BRANCH = '1.21';
const BASE_URL = `https://raw.githubusercontent.com/PixiGeko/Minecraft-default-assets/${BRANCH}`;

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'minecraft', 'models', 'block');

// Common block models - we'll download the key ones
const BLOCK_MODELS = [
    'cube', 'cube_all', 'cube_column', 'cube_column_horizontal', 'cube_bottom_top',
    'cube_top', 'cube_directional', 'cube_mirrored', 'cube_mirrored_all',
    'orientable', 'orientable_with_bottom', 'orientable_vertical',
    'block', 'leaves', 'cross', 'tinted_cross', 'crop', 'stem_fruit', 'stem_growth0',
    'slab', 'slab_top', 'stairs', 'inner_stairs', 'outer_stairs',
    'fence_post', 'fence_side', 'fence_gate', 'fence_gate_open', 'fence_gate_wall',
    'wall_post', 'wall_side', 'wall_side_tall',
    'pressure_plate_up', 'pressure_plate_down', 'button', 'button_pressed',
    'door_bottom_left', 'door_bottom_right', 'door_top_left', 'door_top_right',
    'trapdoor_bottom', 'trapdoor_open', 'trapdoor_top',
    'thin_block', 'carpet', 'template_anvil', 'template_torch', 'template_torch_wall',
    'template_lantern_hanging', 'template_lantern', 'template_glazed_terracotta',
    'template_single_face', 'template_orientable_trapdoor_bottom',
    'rail_flat', 'rail_raised_ne', 'rail_raised_sw', 'template_rail_raised_ne', 'template_rail_raised_sw',
];

async function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        https.get(url, (res) => {
            if (res.statusCode === 404) {
                resolve(false);
                return;
            }
            const file = fs.createWriteStream(outputPath);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(true);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function main() {
    console.log('Downloading Minecraft block models...\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let downloaded = 0;
    for (const model of BLOCK_MODELS) {
        const url = `${BASE_URL}/assets/minecraft/models/block/${model}.json`;
        const outputPath = path.join(OUTPUT_DIR, `${model}.json`);

        try {
            const success = await downloadFile(url, outputPath);
            if (success) {
                console.log(`Downloaded: ${model}.json`);
                downloaded++;
            }
        } catch (err) {
            console.error(`Failed: ${model}.json - ${err.message}`);
        }
    }

    console.log(`\nDownloaded ${downloaded} base models`);
}

main().catch(console.error);
