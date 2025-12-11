const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://raw.githubusercontent.com/ZtechNetwork/MCBVanillaResourcePack/master/models/entity/';
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'minecraft', 'models', 'entity');

// Entity models to download with fallback options
const ENTITY_MODELS = [
  { primary: 'zombie.geo.json', fallbacks: [] },
  { primary: 'creeper.geo.json', fallbacks: [] },
  { primary: 'pig.geo.json', fallbacks: [] },
  { primary: 'cow.geo.json', fallbacks: [] },
  { primary: 'chicken.geo.json', fallbacks: [] },
  { primary: 'sheep.geo.json', fallbacks: [] },
  { primary: 'spider.geo.json', fallbacks: [] },
  { primary: 'skeleton.geo.json', fallbacks: [] },
  { primary: 'enderman.geo.json', fallbacks: [] },
  { primary: 'villager.geo.json', fallbacks: ['villager_v2.geo.json'] },
  { primary: 'iron_golem.geo.json', fallbacks: [] },
  { primary: 'wolf.geo.json', fallbacks: [] },
  { primary: 'cat.geo.json', fallbacks: ['ocelot.geo.json'] },
  { primary: 'horse.geo.json', fallbacks: ['horse.v2.geo.json'] },
  { primary: 'slime.geo.json', fallbacks: [] },
  { primary: 'ghast.geo.json', fallbacks: [] },
  { primary: 'blaze.geo.json', fallbacks: [] },
  { primary: 'wither.geo.json', fallbacks: [] },
  { primary: 'dragon.geo.json', fallbacks: ['ender_dragon.geo.json'] },
  { primary: 'bee.geo.json', fallbacks: [] },
  { primary: 'humanoid.geo.json', fallbacks: ['player.geo.json'] },
];

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created directory: ${OUTPUT_DIR}`);
}

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(outputPath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve({ success: true, statusCode: 200 });
        });

        fileStream.on('error', (err) => {
          fs.unlink(outputPath, () => {}); // Delete partial file
          reject(err);
        });
      } else if (response.statusCode === 404) {
        resolve({ success: false, statusCode: 404 });
      } else {
        resolve({ success: false, statusCode: response.statusCode });
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadEntityModel(modelConfig) {
  const filenames = [modelConfig.primary, ...modelConfig.fallbacks];

  for (const filename of filenames) {
    const url = BASE_URL + filename;
    const outputPath = path.join(OUTPUT_DIR, filename);

    try {
      console.log(`Attempting to download: ${filename}`);
      const result = await downloadFile(url, outputPath);

      if (result.success) {
        console.log(`✓ Successfully downloaded: ${filename}`);
        return { success: true, filename };
      } else if (result.statusCode === 404) {
        console.log(`  404 Not Found: ${filename}`);
        // Continue to try fallbacks
      } else {
        console.log(`  Failed with status ${result.statusCode}: ${filename}`);
      }
    } catch (error) {
      console.error(`  Error downloading ${filename}:`, error.message);
    }
  }

  return { success: false, attempted: filenames };
}

async function main() {
  console.log('Starting Minecraft Bedrock entity model downloads...\n');
  console.log(`Source: ${BASE_URL}`);
  console.log(`Destination: ${OUTPUT_DIR}\n`);

  const results = {
    successful: [],
    failed: []
  };

  for (const modelConfig of ENTITY_MODELS) {
    const result = await downloadEntityModel(modelConfig);

    if (result.success) {
      results.successful.push(result.filename);
    } else {
      results.failed.push(modelConfig.primary);
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Download Summary:');
  console.log('='.repeat(60));
  console.log(`✓ Successful: ${results.successful.length}`);
  console.log(`✗ Failed: ${results.failed.length}`);

  if (results.successful.length > 0) {
    console.log('\nSuccessfully downloaded:');
    results.successful.forEach(filename => console.log(`  - ${filename}`));
  }

  if (results.failed.length > 0) {
    console.log('\nFailed to download:');
    results.failed.forEach(filename => console.log(`  - ${filename}`));
  }

  console.log('\nDone!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
