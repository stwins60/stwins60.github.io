# stwins60.github.io

Personal site of Idris Fagbemi: <https://stwins60.github.io>

A dependency-light Jekyll site: custom layouts, one plain CSS file, two small
scripts, and no third-party runtime assets. GitHub Pages builds and deploys it
from `master`.

## Where content lives

| What | File | Maintained by |
| --- | --- | --- |
| About text, services, roles, degrees, articles | `_data/africantech.json` | **Synced** from [africantech.dev](https://africantech.dev) |
| Curated bullets / titles for synced roles | `_data/experience.yml` | You (matched on company via `match:`) |
| Curated degree names | `_data/education.yml` | You (matched on school via `match:`) |
| Skills | `_data/skills.yml` | You |
| Projects (`featured: true` shows on home) | `_data/projects.yml` | You |
| Name, email, social links | `_config.yml` | You |

Don't hand-edit `_data/africantech.json`; the next sync overwrites it. Put
overrides in the YAML files instead. A role that appears on africantech.dev
with no matching override is shown automatically using its paragraph
description.

## Syncing from africantech.dev

`.github/workflows/sync-africantech.yml` runs daily (and on demand from the
Actions tab). It runs `scripts/sync-africantech.mjs`, commits
`_data/africantech.json` if anything changed, and asks Pages to rebuild.

The script has no dependencies and treats scraped content as untrusted
(tags stripped, http(s) URLs only, output escaped by the templates). If the
source markup changes and a required section can't be parsed, it fails
without touching the existing data.

Run it locally with Node 18+:

```sh
node scripts/sync-africantech.mjs
```

## Local preview

With Ruby 3.x and Bundler:

```sh
bundle install
bundle exec jekyll serve --livereload
```

Or with Docker, no Ruby needed:

```sh
docker run --rm -it -p 4000:4000 -v "$PWD":/srv -w /srv ruby:3.3 \
  sh -c "bundle install && bundle exec jekyll serve --host 0.0.0.0"
```

The `Gemfile` uses Jekyll 4 for local preview. GitHub Pages builds with its own
Jekyll 3.10 toolchain, so stick to features and plugins both support
(the four in `_config.yml` are on the Pages allow-list).

## Security

- Content Security Policy (meta tag): same-origin scripts, styles, images and fonts only.
- No CDN scripts, no analytics, no inline scripts.
- GitHub Actions are pinned to commit SHAs and run with least-privilege tokens.
- Dependabot keeps the Bundler and Actions dependencies current; CodeQL scans the JS and workflows.
