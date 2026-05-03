# CLAUDE.md

Personal blog at https://callmarx.dev — Jekyll + Tailwind + Hotwire, deployed on Netlify. This file orients Claude (and future-me) on conventions and workflows specific to this repo.

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
├── _config.yml           # Jekyll site config (PT-BR is default locale)
├── _data/
│   ├── translations.yml  # i18n strings keyed by `en_US` / `pt_BR`
│   └── social-networks.yml
├── _includes/            # header, footer, analytics, translate-icon, etc.
├── _layouts/             # default | index | post | autopages_tags
├── _plugins/
│   └── tag_page_plugin.rb  # generates /tags/:slug for both locales
├── assets/
│   ├── main.js           # Webpack entry — imports main.css + Turbo + Stimulus auto-loader
│   ├── main.css          # Tailwind v4 CSS-first config (@theme, @utility prose-custom, @custom-variant dark) + custom utilities (.align-*, .note-*)
│   ├── js/controllers/   # Stimulus controllers (dark_mode_controller.js)
│   └── css/syntax-highlight/  # Rouge theme (highcontrast-monokai)
├── index.md              # PT-BR home (default locale)
├── pt-br/
│   ├── about.md
│   ├── _posts/           # PT-BR posts
│   └── tags/             # tag index
└── en/
    ├── about.md
    ├── index.md
    ├── _posts/           # EN posts
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

Every post is **paired**: write the PT-BR version in `src/pt-br/_posts/` AND the EN version in `src/en/_posts/`. Same date, same slug-style filename. The header's translate-icon links between them via the `lang-ref` field — if you forget to pair, the toggle becomes a dead link.

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

- Default locale = PT-BR. EN routes live under `/en/`.
- `page.locale` (`pt_BR` | `en_US`) drives all translation lookups via `site.data.translations[key][page.locale]`.
- Add a new translatable string by editing `src/_data/translations.yml` — both keys required.
- `_includes/translate-icon.html` resolves the cross-language URL: posts via `lang-ref` match, regular pages by URL prefix (`/en/` ↔ `/`).
- The custom `tag_page_plugin.rb` generates a `/tags/:slug` page per language for every tag found in `site.tags`.

## Layouts

| Layout | Use |
|---|---|
| `default` | shell — head, header, footer wrapper |
| `index` | home page (avatar + about blurb + paginated post list inside `<turbo-frame id="listing-posts">`) |
| `post` | article view (title, date, hero image, prose) |
| `autopages_tags` | per-tag landing page (rendered by `tag_page_plugin.rb`) |

Pagination uses `jekyll-paginate-v2` (`per_page: 4`, descending by date), wrapped in a Turbo Frame so prev/next never reloads the page.

## Asset pipeline

- Webpack entry: `src/assets/main.js` → emits `src/assets/main-bundle.js` + `main-bundle.css` (extracted via `mini-css-extract-plugin`).
- CSS pipeline: `css-loader` → `@tailwindcss/webpack` (no PostCSS, no `postcss.config.js`, no `tailwind.config.js`). All Tailwind setup lives in `src/assets/main.css`.
- Stimulus controllers auto-loaded from `src/assets/js/controllers/**/*.js` via `@hotwired/stimulus-webpack-helpers`.
- Tailwind config — declared inside `src/assets/main.css`:
  - `@import "tailwindcss"` + `@plugin "@tailwindcss/typography"`.
  - `@custom-variant dark (&:where(.dark, .dark *))` — class-strategy dark mode (toggled by dark-mode controller, persisted in `localStorage.theme`; FOUC guard in `_includes/head-darkmode-check.html`).
  - `@theme {}` block: custom `beige` palette (`--color-beige-*`), `xs` breakpoint (`--breakpoint-xs: 28rem`), `--spacing-112`, `--font-marker`, `--font-codepro`.
  - `@utility prose-custom` defines all `--tw-prose-*` tokens (typography plugin v4 entrypoint).
  - Fonts: `Permanent Marker` (`font-marker`), `Source Code Pro` (`font-codepro`) — loaded from Google Fonts in `_layouts/default.html`.
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

## Upgrade backlog (May 2026)

Stack pins are current. Remaining cleanup:

| Component | Current | Latest | Notes |
|---|---|---|---|
| Twitter link | active | dead-ish | `twitter.com/callmarx_dev` → consider X domain or remove. |
| `deploy` branch | stale | — | delete locally + on origin. |
