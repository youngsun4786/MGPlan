/**
 * Post-build script: builds the service worker with Workbox injectManifest.
 *
 * vite-plugin-pwa's closeBundle hook does not fire correctly with TanStack Start's
 * Vite 7 environment builder API (sharedPlugins + buildApp). This script runs
 * after `vite build` to compile app/sw.ts and inject the precache manifest.
 */
import { injectManifest } from 'workbox-build'
import { build } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

// Step 1: Build sw.ts to sw.js using Vite (handles TS + ESM imports)
await build({
  root,
  configFile: false,
  build: {
    lib: {
      entry: resolve(root, 'app/sw.ts'),
      formats: ['es'],
      fileName: () => 'sw.js',
    },
    outDir: resolve(root, 'dist/client'),
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'sw.js',
      },
    },
  },
})

// Step 2: Inject the precache manifest into the built SW
const { count, size, warnings } = await injectManifest({
  swSrc: resolve(root, 'dist/client/sw.js'),
  swDest: resolve(root, 'dist/client/sw.js'),
  globDirectory: resolve(root, 'dist/client'),
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
  // Exclude the SW itself from the precache manifest
  globIgnores: ['sw.js'],
})

if (warnings.length > 0) {
  console.warn('Workbox warnings:', warnings.join('\n'))
}

console.log(`SW build complete: ${count} files, ${(size / 1024).toFixed(1)}KB total`)
