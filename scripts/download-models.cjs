#!/usr/bin/env node
// Script to download Minecraft block models

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO = 'PixiGeko/Minecraft-default-assets';
const BRANCH = '1.21';
const API_URL = `https://api.github.com/repos/${REPO}/contents`;

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'minecraft', 'models', 'block');

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

async function main() {
    console.log('Downloading Minecraft block models...\n');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const url = `${API_URL}/assets/minecraft/models/block?ref=${BRANCH}`;
    console.log('Fetching model list...');

    const contents = await fetchJSON(url);

    if (!Array.isArray(contents)) {
        console.error('Failed to get model list');
        return;
    }

    console.log(`Found ${contents.length} models\n`);

    let count = 0;
    for (const item of contents) {
        if (item.type === 'file' && item.name.endsWith('.json')) {
            const outputPath = path.join(OUTPUT_DIR, item.name);
            try {
                await downloadFile(item.download_url, outputPath);
                count++;
                if (count % 50 === 0) {
                    console.log(`Downloaded ${count} models...`);
                }
            } catch (err) {
                console.error(`Failed to download ${item.name}: ${err.message}`);
            }
        }
    }

    console.log(`\nDownloaded ${count} block models`);
}

main().catch(console.error);
