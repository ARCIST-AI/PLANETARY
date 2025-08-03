import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'index.js',
  output: [
    {
      file: 'dist/tooltip-system.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/tooltip-system.umd.js',
      format: 'umd',
      name: 'PlanetaryTooltipSystem',
      sourcemap: true
    }
  ],
  plugins: [
    nodeResolve({
      browser: true
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: ['> 1%', 'last 2 versions', 'not dead', 'not ie 11']
            }
          }
        ]
      ]
    })
  ],
  external: []
};