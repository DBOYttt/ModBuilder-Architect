#!/usr/bin/env node
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const distAssetsDir = path.resolve('dist/assets');
const jsLimitBytes = Number.parseInt(process.env.BUNDLE_MAX_TOTAL_BYTES ?? '1400000', 10);
const largestChunkLimitBytes = Number.parseInt(process.env.BUNDLE_MAX_CHUNK_BYTES ?? '800000', 10);

const formatKb = (bytes) => `${(bytes / 1024).toFixed(2)} kB`;

try {
  const assetNames = await readdir(distAssetsDir);
  const jsAssets = assetNames.filter((name) => name.endsWith('.js')).sort();

  if (jsAssets.length === 0) {
    throw new Error(`No JavaScript assets found in ${distAssetsDir}`);
  }

  const assets = await Promise.all(
    jsAssets.map(async (name) => {
      const filePath = path.join(distAssetsDir, name);
      const { size } = await stat(filePath);
      return { name, size };
    }),
  );

  const totalBytes = assets.reduce((sum, asset) => sum + asset.size, 0);
  const largestAsset = assets.reduce((largest, asset) =>
    asset.size > largest.size ? asset : largest,
  );

  console.log('Bundle size summary:');
  for (const asset of assets) {
    console.log(`- ${asset.name}: ${formatKb(asset.size)}`);
  }
  console.log(`Total JS size: ${formatKb(totalBytes)}`);
  console.log(`Largest JS chunk: ${largestAsset.name} (${formatKb(largestAsset.size)})`);
  console.log(`Limits: total <= ${formatKb(jsLimitBytes)}, largest chunk <= ${formatKb(largestChunkLimitBytes)}`);

  const failures = [];
  if (totalBytes > jsLimitBytes) {
    failures.push(
      `Total JS size ${formatKb(totalBytes)} exceeds limit ${formatKb(jsLimitBytes)}`,
    );
  }
  if (largestAsset.size > largestChunkLimitBytes) {
    failures.push(
      `Largest JS chunk ${largestAsset.name} (${formatKb(largestAsset.size)}) exceeds limit ${formatKb(largestChunkLimitBytes)}`,
    );
  }

  if (failures.length > 0) {
    console.error('\nBundle size check failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('\nBundle size check passed.');
} catch (error) {
  console.error('Bundle size check failed to run.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
