import { build } from 'esbuild';
import { join } from 'path';

async function run() {
  await build({
    entryPoints: [join('electron', 'main.ts'), join('electron', 'preload.ts')],
    outdir: join('dist', 'electron'),
    bundle: true,
    platform: 'node',
    target: 'node18',
    sourcemap: true,
    format: 'cjs',
    external: ['electron']
  });

  console.log('Electron build completed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
