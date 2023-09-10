import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"
import json from "@rollup/plugin-json"
import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

/** @type {import('rollup').RollupOptions} */
export default [{
    input: 'src/extension.js',
    output: {
        file: 'dist/extension.min.cjs',
        format: 'cjs'
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        json(),
        terser()
    ],
    external: ['vscode']
}]