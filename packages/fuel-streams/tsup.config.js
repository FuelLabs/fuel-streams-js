import baseConfig from '@fuels/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  ...baseConfig(options, { withReact: false }),
  entry: ['src/index.ts', 'src/subjects-defs.ts'],
  external: [],
  minify: 'terser',
  dts: true,
  splitting: true,
  metafile: true,
}));
