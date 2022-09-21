import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: {
      index: 'src/_module.ts'
    },
    format: ['cjs', 'esm'],
    splitting: false,
    clean: true,
    minify: false,
    dts: true,
    sourcemap: false
  }
});
