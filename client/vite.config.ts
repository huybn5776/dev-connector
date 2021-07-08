/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';

import reactRefresh from '@vitejs/plugin-react-refresh';
import { Alias, defineConfig } from 'vite';

import { postcssIncreaseSpecificity } from './src/config/increase-specificity';
import * as tsconfig from './tsconfig.json';

function readAliasFromTsConfig(): Alias[] {
  const pathReplaceRegex = new RegExp(/\/\*$/, '');
  return Object.entries(tsconfig.compilerOptions.paths).reduce((aliases, [fromPaths, toPaths]) => {
    const find = fromPaths.replace(pathReplaceRegex, '');
    const toPath = toPaths[0].replace(pathReplaceRegex, '');
    const replacement = path.resolve(__dirname, toPath);
    aliases.push({ find, replacement });
    return aliases;
  }, [] as Alias[]);
}

export default defineConfig({
  plugins: [reactRefresh()],
  resolve: {
    alias: readAliasFromTsConfig(),
  },
  css: {
    modules: { localsConvention: 'camelCase' },
    postcss: { plugins: [postcssIncreaseSpecificity()] },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        rewrite: (urlPath) => urlPath.replace(/^\/api/, ''),
        timeout: 10000,
      },
    },
  },
  build: {
    outDir: 'build',
  },
});
