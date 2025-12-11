#!/usr/bin/env node
// Script to download Minecraft default assets from PixiGeko repository

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO = 'PixiGeko/Minecraft-default-assets';
const BRANCH = '1.21';
const BASE_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`;
const API_URL = `https://api.github.com/repos/${REPO}/contents`;

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'minecraft');

// Directories to download
const ASSETS_TO_DOWNLOAD = [
    { path: 'assets/minecraft/textures/block', output: 'textures/block' },
    { path: 'assets/minecraft/textures/entity', output: 'textures/entity' },
    { path: 'assets/minecraft/models/block', output: 'models/block' },
    { path: 'assets/minecraft/blockstates', output: 'blockstates' },
];

async function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'ModBlock-Architect',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const file = fs.createWriteStream(outputPath);
        https.get(url, (res) => {
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });
    });
}

async function downloadDirectory(apiPath, outputDir, depth = 0) {
    const url = `${API_URL}/${apiPath}?ref=${BRANCH}`;
    console.log(`  ${'  '.repeat(depth)}Fetching: ${apiPath}`);

    try {
        const contents = await fetchJSON(url);

        if (!Array.isArray(contents)) {
            console.error(`  ${'  '.repeat(depth)}Not a directory: ${apiPath}`);
            return;
        }

        for (const item of contents) {
            const outputPath = path.join(OUTPUT_DIR, outputDir, item.name);

            if (item.type === 'file') {
                console.log(`  ${'  '.repeat(depth)}Downloading: ${item.name}`);
                await downloadFile(item.download_url, outputPath);
            } else if (item.type === 'dir') {
                await downloadDirectory(
                    `${apiPath}/${item.name}`,
                    path.join(outputDir, item.name),
                    depth + 1
                );
            }
        }
    } catch (err) {
        console.error(`  ${'  '.repeat(depth)}Error: ${err.message}`);
    }
}

async function main() {
    console.log('Downloading Minecraft default assets...\n');
    console.log(`Output directory: ${OUTPUT_DIR}\n`);

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const asset of ASSETS_TO_DOWNLOAD) {
        console.log(`\nDownloading ${asset.path}...`);
        await downloadDirectory(asset.path, asset.output);

        // Rate limiting - wait between directories
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('\n\nDownload complete!');
}

main().catch(console.error);
