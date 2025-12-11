#!/usr/bin/env node
// Script to download missing entity textures

const fs = require('fs');
const path = require('path');
const https = require('https');

const BRANCH = '1.21';
const BASE_URL = `https://raw.githubusercontent.com/PixiGeko/Minecraft-default-assets/${BRANCH}/assets/minecraft/textures/entity`;
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'minecraft', 'textures', 'entity');

// Missing directories with their files
const MISSING_ENTITIES = {
    'zombie': ['zombie.png', 'drowned.png', 'husk.png', 'drowned_outer_layer.png'],
    'villager': ['villager.png'],
    'villager/profession': ['armorer.png', 'butcher.png', 'cartographer.png', 'cleric.png', 'farmer.png', 'fisherman.png', 'fletcher.png', 'leatherworker.png', 'librarian.png', 'mason.png', 'nitwit.png', 'none.png', 'shepherd.png', 'toolsmith.png', 'weaponsmith.png'],
    'villager/type': ['desert.png', 'jungle.png', 'plains.png', 'savanna.png', 'snow.png', 'swamp.png', 'taiga.png'],
    'warden': ['warden.png', 'warden_bioluminescent_layer.png', 'warden_heart.png', 'warden_pulsating_spots_1.png', 'warden_pulsating_spots_2.png'],
    'wither': ['wither.png', 'wither_armor.png', 'wither_invulnerable.png'],
    'wolf': ['wolf.png', 'wolf_angry.png', 'wolf_tame.png', 'wolf_collar.png'],
    'squid': ['squid.png', 'glow_squid.png'],
    'strider': ['strider.png', 'strider_cold.png', 'strider_saddle.png'],
    'creeper': ['creeper.png', 'creeper_armor.png'],
    'enderman': ['enderman.png', 'enderman_eyes.png'],
};

async function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        https.get(url, (res) => {
            if (res.statusCode === 404) {
                console.log(`  Not found: ${path.basename(outputPath)}`);
                resolve(false);
                return;
            }
            if (res.statusCode === 302 || res.statusCode === 301) {
                // Follow redirect
                https.get(res.headers.location, (res2) => {
                    const file = fs.createWriteStream(outputPath);
                    res2.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve(true);
                    });
                }).on('error', reject);
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
    console.log('Downloading missing entity textures...\n');

    let totalDownloaded = 0;

    for (const [folder, files] of Object.entries(MISSING_ENTITIES)) {
        console.log(`\n${folder}/`);

        for (const file of files) {
            const url = `${BASE_URL}/${folder}/${file}`;
            const outputPath = path.join(OUTPUT_DIR, folder, file);

            try {
                const success = await downloadFile(url, outputPath);
                if (success) {
                    console.log(`  Downloaded: ${file}`);
                    totalDownloaded++;
                }
            } catch (err) {
                console.error(`  Failed: ${file} - ${err.message}`);
            }
        }
    }

    console.log(`\n\nDownloaded ${totalDownloaded} missing entity textures`);
}

main().catch(console.error);
