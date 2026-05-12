# NexusHub Website

[![Jekyll Check](https://github.com/tomeksdev/nexus-hub/actions/workflows/jekyll-check.yml/badge.svg)](https://github.com/tomeksdev/nexus-hub/actions/workflows/jekyll-check.yml)
[![Code Scan](https://github.com/tomeksdev/nexus-hub/actions/workflows/code-scan.yml/badge.svg)](https://github.com/tomeksdev/nexus-hub/actions/workflows/code-scan.yml)
[![Website](https://img.shields.io/badge/website-nexushub.tools-e53935)](https://nexushub.tools)
[![Jekyll](https://img.shields.io/badge/Jekyll-GitHub%20Pages-cc0000?logo=jekyll&logoColor=white)](https://jekyllrb.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.8-7952b3?logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Font Awesome](https://img.shields.io/badge/Font%20Awesome-7.2.0-528dd7?logo=fontawesome&logoColor=white)](https://fontawesome.com/)
[![No CDN](https://img.shields.io/badge/assets-no%20CDN-22c55e)](#local-assets)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

Official Jekyll landing page and documentation site for [NexusHub](https://github.com/tomeksdev/NexusHub), a self-hosted WireGuard management platform with eBPF security rules, dashboard operations, API/CLI workflows, observability, and deployment guides.

The production site is published at [nexushub.tools](https://nexushub.tools). It is designed for GitHub Pages with a custom domain, so `_config.yml` intentionally uses `baseurl: ""`.

## What This Site Includes

- Responsive NexusHub landing page with the real project logo and dark/red visual system.
- Local wiki-style docs under `/docs/`.
- Bootstrap and Font Awesome vendored into the repository.
- CI checks for Jekyll builds, local asset paths, CDN usage, CodeQL, and npm dependency audit.

## Project Structure

```text
_config.yml             Jekyll and GitHub Pages settings
index.html              Landing page
docs/                   Local documentation pages
_data/                  Features, docs cards, and roadmap content
_includes/header.html   Shared site header
_layouts/               Page layouts
assets/css/main.css     Custom design system and responsive styles
assets/img/             Logo and image assets
assets/vendor/          Vendored Bootstrap and Font Awesome assets
scripts/                Asset vendoring and validation scripts
```

## Local Development

Install packages and vendor frontend assets:

```sh
npm install
npm run vendor
```

Install Ruby dependencies locally:

```sh
bundle config set --local path vendor/bundle
bundle install
```

Run the site:

```sh
bundle exec jekyll serve --host 0.0.0.0 --baseurl ""
```

Open `http://localhost:4000/` or `http://<host-ip>:4000/`.

## Verification

Run the same core checks used by CI:

```sh
npm run check:cdn
bundle exec jekyll build
npm audit --omit=dev --audit-level=moderate
```

If Bundler fails with missing Ruby headers:

```sh
sudo apt update
sudo apt install -y ruby-dev build-essential zlib1g-dev
```

## Local Assets

This site must not depend on CDNs. Bootstrap and Font Awesome are installed from npm, then copied into `assets/vendor/`:

```sh
npm run vendor
```

After package updates, rerun `npm run vendor`, rebuild the site, and confirm `npm run check:cdn` passes.

## GitHub Actions

- `Jekyll Check` builds the site, vendors assets, checks for CDN references, and verifies generated files.
- `Code Scan` runs CodeQL for JavaScript plus an npm dependency audit on pushes, pull requests, weekly schedule, and manual dispatch.

## Branding

NexusHub is an open-source project. You are welcome to fork, modify, and redistribute the code under the GPL-3.0 license.

Please do not present modified versions, forks, or separate websites as the official NexusHub project unless they are maintained by the original project author.

Acceptable examples:

- "Fork of NexusHub"
- "Based on NexusHub"
- "Unofficial NexusHub build"

Not acceptable:

- "Official NexusHub"
- "NexusHub official website"
- Using the NexusHub name/logo in a way that suggests your project is the original official project

## License

This website is licensed under the GNU General Public License v3.0, matching the main NexusHub project.
See [LICENSE](LICENSE) for details.

## Deployment

GitHub Pages serves the custom domain root:

```yaml
url: "https://nexushub.tools"
baseurl: ""
```

Do not reintroduce `/nexus-hub` into asset paths unless the site is moved back to a project-page URL.
