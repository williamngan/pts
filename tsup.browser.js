import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: {
      pts: 'src/_script.ts'
    },
    format: ['iife'],
    platform: 'browser',
    splitting: false,
    clean: false,
    outExtension({ format }) {
      return {
        js: `.js`,
      }
    },
    banner: {
      js: `/* Copyright © 2017-${new Date().getFullYear()} William Ngan and contributors.\nLicensed under Apache 2.0 License.\nSee https://github.com/williamngan/pts for details. */`
    }
  }
});
