# Documentation runtime

`vue.min.js` and `markdown-it.min.js` are production browser builds from the
exact versions in the root `package.json` and `pnpm-lock.yaml`. Their upstream
license notices are retained in each file.

Run `pnpm build:docs-runtime` after updating these dependencies. `pnpm check:docs`
verifies the committed copies match the installed packages before browser tests.

`doc.js` uses Vue 3's global Options API and renders Markdown with raw HTML
disabled. API comments are content, not templates or executable markup.
