import typescript from '@rollup/plugin-typescript'
export default {
  input: './src/index.ts',
  output: [
    // 1. cjs => commonJS
    // 2. esm
    {
      type: 'cjs',
      file: 'lib/mini-vue.cjs.js'
    },
    {
      type: 'es',
      file: 'lib/mini-vue.esm.js'
    }
  ],
  plugins: [typescript()]
}
