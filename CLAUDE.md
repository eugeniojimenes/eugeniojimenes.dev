# CLAUDE.md

Personal blog at https://eugeniojimenes.dev — Jekyll + Tailwind v4 + Hotwire, deployed on Netlify. Terminal-flavored UI, Tokyo Night dark theme by default with a beige light mode. This file orients Claude (and future-me) on conventions and workflows specific to this repo.

## Stack snapshot

- **Static generator:** Jekyll 4.3.x (`src/` source → `src/_site/` output)
- **Styling:** Tailwind CSS 4.x (CSS-first `@theme` config in `src/assets/main.css`, `@tailwindcss/webpack` loader, dark mode via `class` strategy through `@custom-variant`)
- **JS:** Hotwire (Turbo 8.x, Stimulus 3.2.x) bundled by Webpack 5 — page morphing + View Transitions enabled via `<meta>` tags in `_layouts/default.html`
- **Plugins:** `jekyll-paginate-v2`, `jekyll-seo-tag`, `jekyll-sitemap`
- **Ruby:** 3.4.9 (`.ruby-version`, `mise.toml`) — managed via Bundler
- **Node:** 22 LTS / NPM 10 (per `netlify.toml`, `mise.toml`)
- **Hosting:** Netlify (`netlify.toml` drives build)
- **Process manager:** Foreman via `Procfile.dev`

See "Upgrade backlog" at bottom — most pins are behind latest.

## Repo layout

```
src/
├── _config.yml           # Jekyll site config (EN is default locale)
├── _data/
│   ├── translations.yml  # i18n strings keyed by `en_US` / `pt_BR`
│   └── social-networks.yml
├── _includes/            # header, footer, analytics, translate-icon, listed-post, etc.
├── _layouts/             # default | index | post | about | autopages_tags
├── _plugins/
│   └── tag_page_plugin.rb  # generates /tags/:slug for both locales
├── assets/
│   ├── favicon.svg       # terminal-style SVG favicon
│   ├── main.js           # Webpack entry — imports main.css + Turbo + Stimulus auto-loader
│   ├── main.css          # Tailwind v4 CSS-first config (@theme, @utility prose-custom, @custom-variant dark) + Tokyo Night palette + CRT scanlines/grain overlay + custom utilities
│   ├── js/controllers/   # Stimulus: dark_mode, command_palette, copy_code
│   ├── gifs/             # animated assets
│   └── css/syntax-highlight/  # Rouge theme (highcontrast-monokai)
├── index.md              # EN home (default locale)
├── about.md              # EN about
├── search.json           # post index consumed by command palette (Cmd/Ctrl+K)
├── _posts/               # EN posts
├── tags/                 # EN tag index
└── pt-br/
    ├── about.md
    ├── index.md
    ├── _posts/           # PT-BR posts
    └── tags/
bin/
├── dev    # foreman start -f Procfile.dev (jekyll + webpack watchers)
├── build  # npm run build:prod
└── clear  # jekyll clean
```

## Dev workflows

```bash
bin/dev      # start dev server (jekyll serve --livereload + webpack --watch in parallel)
bin/build    # production build (webpack + jekyll, both with NODE_ENV/JEKYLL_ENV=production)
bin/clear    # purge _site/ + jekyll caches
```

**Always use `bin/dev`** — running `jekyll serve` alone skips the webpack watcher, so JS/CSS bundles go stale.

Direct npm scripts (rarely needed):
- `npm run develop:jekyll` / `npm run develop:webpack` (individual watchers)
- `npm run build:jekyll` / `npm run build:webpack` (individual prod builds)
- `npm run clear`

## Authoring posts (bilingual)

Every post is **paired**: write the EN version in `src/_posts/` AND the PT-BR version in `src/pt-br/_posts/`. Same date, same slug-style filename. The header's translate-icon links between them via the `lang-ref` field — if you forget to pair, the toggle becomes a dead link.

Filename: `YYYY-MM-DD-slug.md` (slug differs per language — e.g. `etags-in-rails.md` vs `etags-no-rails.md`).

Required front-matter:

```yaml
---
layout: post
title:  "Title in target language"
date:   2024-06-21 13:10:53 -0300
locale: en_US           # or pt_BR
lang-ref: etags-in-rails  # SAME value in both language pairs — links translations
tags: TIL Ruby Rails Etag Cache  # space-separated
image: /assets/images/paper-tag.webp
image_alt: "Alt text in target language."
description: >-
  One- or two-line summary used by SEO + meta tags.
---
```

Body conventions:
- `<!-- excerpt-end -->` marker after the lead paragraph — used by `listed-post.html` for previews on the index/tag pages.
- Custom prose helpers in `main.css`:
  - `{: .align-center}` / `.align-left` / `.align-right` on images
  - `{: .note-info}` / `.note-warning` for callout boxes
  - `.img-increase` for upscaled images
- Code blocks use Rouge (kramdown highlighter) → `highcontrast-monokai` theme.

## i18n internals

- Default locale = EN (at root `/`). PT-BR routes live under `/pt-br/`.
- `page.locale` (`en_US` | `pt_BR`) drives all translation lookups via `site.data.translations[key][page.locale]`.
- `<html lang>` is derived from `page.url` (paginate-v2 mangles `page.locale` on paginated pages).
- Add a new translatable string by editing `src/_data/translations.yml` — both keys required.
- `_includes/translate-icon.html` resolves the cross-language URL: posts via `lang-ref` match, regular pages by URL prefix (`/` ↔ `/pt-br/`).
- The custom `tag_page_plugin.rb` generates a `/tags/:slug` page per language for every tag found in `site.tags`.
- Netlify `_redirects` keep old `/en/*` paths 301'd to the new root.

## Layouts

| Layout | Use |
|---|---|
| `default` | shell — head, header, footer, command-palette dialog (`data-turbo-permanent`) |
| `index` | home page (terminal hero `$ whoami` + bio + `[ ~/posts ]` / `[ resume.pdf ↗ ]` CTAs + paginated post list under `$ ls ~/posts/` inside `<turbo-frame id="listing-posts">`) |
| `about` | about page wrapper |
| `post` | article view (sans-serif body, Tokyo palette for code/links) |
| `autopages_tags` | per-tag landing page (rendered by `tag_page_plugin.rb`) |

Pagination uses `jekyll-paginate-v2` (`per_page: 4`, descending by date), wrapped in a Turbo Frame so prev/next never reloads the page.

## Asset pipeline

- Webpack entry: `src/assets/main.js` → emits `src/assets/main-bundle.js` + `main-bundle.css` (extracted via `mini-css-extract-plugin`).
- CSS pipeline: `css-loader` → `@tailwindcss/webpack` (no PostCSS, no `postcss.config.js`, no `tailwind.config.js`). All Tailwind setup lives in `src/assets/main.css`.
- Stimulus controllers auto-loaded from `src/assets/js/controllers/**/*.js` via `@hotwired/stimulus-webpack-helpers`:
  - `dark_mode_controller` — flips `.dark` on `<html>`, persists in `localStorage.theme`. Dark is default (no OS-pref fallback).
  - `command_palette_controller` — `Cmd/Ctrl+K` opens CLI-style search dialog; fetches `/search.json`, filters by current `<html lang>`, arrow-keys + Enter to navigate via `Turbo.visit`, Esc / backdrop to close. Dialog markup lives in `_layouts/default.html` with `data-turbo-permanent`.
  - `copy_code_controller` — per-block copy button on Rouge code blocks. `main.js` re-attaches it after `turbo:load` / `turbo:render` so new blocks pick it up across Turbo navs.
- Tailwind config — declared inside `src/assets/main.css`:
  - `@import "tailwindcss"` + `@plugin "@tailwindcss/typography"`.
  - `@custom-variant dark (&:where(.dark, .dark *))` — class-strategy dark mode (toggled by `dark_mode_controller`, persisted in `localStorage.theme`; FOUC guard in `_includes/head-darkmode-check.html`).
  - `@theme {}` block: Tokyo Night palette (`--color-tokyo-*`: bg `#1a1b26`, fg `#c0caf5`, accents `#7aa2f7` / `#9ece6a` / `#f7768e`), beige "paper" palette for light mode, `xs` breakpoint, `--spacing-112`, `--font-marker`, `--font-codepro` (aliased to Geist Mono).
  - CRT scanlines + grain overlay (dark only) via `body::before` / `body::after`.
  - `@utility prose-custom` defines all `--tw-prose-*` tokens (prose-invert repointed to Tokyo palette).
  - Fonts: `Geist Mono` (body/UI, exposed as `font-codepro`), `Permanent Marker` (wordmark accent, `font-marker`) — loaded from Google Fonts in `_layouts/default.html`. Post bodies use `font-sans` for long-form readability.
- `main-bundle.*` is gitignored — webpack must run before Jekyll (the `bin/build` script and Netlify config both order it that way).

## Commit / branch conventions

- **Conventional Commits** (badge in README). Scopes seen in history: `feat(post)`, `feat(new post)`, `fix(version)`, `fix(layout)`, `fix(description)`, `feat(transition)`. Stick to those when relevant.
- **Branches:** `develop` is the trunk (no `main` branch). Feature work happens on `feat/*` or `fix/*` branches → PR into `develop` → squash/merge.
- The `deploy` branch is stale (no commits ahead/behind develop). Safe to delete.

## Lint / format

- **Rubocop** (`.rubocop.yml`) — only the plugin (`tag_page_plugin.rb`) is Ruby. Pinned to Ruby 3.4 target. `MethodLength` max 15. Run with `bundle exec rubocop` before committing changes to `_plugins/`.
- No JS/CSS linter configured.

## Deploy

- Netlify watches the GitHub repo. Pushes to `develop` (configured branch) trigger `npm run build:prod`.
- Build env (`netlify.toml`):
  - `NODE_VERSION=22`, `NPM_VERSION=10`, `RUBY_VERSION=3.4.9`
  - `JEKYLL_ENV=production`, `NODE_ENV=production` (gates Google Analytics injection in `_includes/analytics.html`)
- Output dir: `src/_site`.

## Things to NOT do

- Don't run `jekyll serve` directly — bypasses webpack, ships stale assets. Use `bin/dev`.
- Don't commit `src/assets/main-bundle.{js,css}` (gitignored — bundle is built per-deploy).
- Don't add a post in only one language unless it's intentional (the translate icon goes dead).
- Don't reuse a `lang-ref` value across unrelated posts — it's the join key for translation pairs.
- Don't change `develop` branch protection without remembering there's no `main` to fall back to.
- Don't use em-dashes (`—`, `–`, or ` — `) in site copy, bios, or any prose written for the user. Join clauses with commas or split into separate sentences instead.
