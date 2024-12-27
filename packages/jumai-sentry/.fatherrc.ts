import {defineConfig} from 'father'

export default defineConfig({
  sourcemap: true,
  umd: {
    entry: 'src/pc.ts',
    // 和原来保持一致
    output: {
      path: 'dist',
      filename: 'pc.umd.min.js',
    },
    externals: [
      'react',
      'react-dom',
    ],
  },
  platform: 'browser',
});
