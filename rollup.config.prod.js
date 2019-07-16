import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'

module.exports = [
  // add config for every entry point
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs'
    },
    plugins: [
      resolve({
        modulesOnly: true
      }),
      babel({
        configFile: './babel.config.js',
        exclude: 'node_modules/**' // only transpile our source code
      }),
      json(),
      terser()
    ]
  }
]
