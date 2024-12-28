import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  entry: {
    index: 'src/index.ts',
    'index.browser': 'src/index.ts',
    'subjects-def': 'src/subjects-def.ts',
    'subjects-def.browser': 'src/subjects-def.ts',
  },
  format: ['cjs', 'esm'],
  external: [],
  minify: 'terser',
  dts: true,
  splitting: true,
  metafile: true,
  platform: 'neutral',
  esbuildOptions(options, context) {
    if (context.format === 'esm') {
      // Browser-specific options
      const entryPoints = Object.keys(options.entryPoints || {});
      if (entryPoints.some((entry) => entry.includes('.browser'))) {
        options.platform = 'browser';
        options.conditions = ['browser', 'module'];
      } else {
        // Node.js ESM options
        options.platform = 'node';
        options.conditions = ['node', 'module'];
      }
    } else {
      // Node.js CommonJS options
      options.platform = 'node';
      options.conditions = ['node', 'require'];
    }
  },
}));
