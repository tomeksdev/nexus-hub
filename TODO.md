# NexusHub Website TODO

## Phase 1 - Foundation

- [x] Create Jekyll/GitHub Pages structure.
- [x] Pin Bootstrap and Font Awesome packages for local, no-CDN assets.
- [x] Exclude `AGENT.md`, `AGENTS.md`, and `design_paterns_and_example.png` from git/publish.
- [x] Capture source-content gap: upstream `FEATURE.md` / `FEAUTURE.md` was not found, so the feature section is derived from the upstream `README.md`.

## Phase 2 - Landing Page

- [x] Build responsive home hero matching the supplied NexusHub design language.
- [x] Add feature cards, dashboard preview, docs summaries, roadmap, screenshots placeholders, and contribution section.
- [x] Add mobile navigation and responsive layout states.
- [x] Configure custom-domain publishing from `/` instead of `/nexus-hub/`.

## Phase 3 - Content Expansion

- [ ] Replace screenshot placeholders with real dashboard screenshots from NexusHub.
- [ ] Update docs cards when upstream docs change.
- [ ] Add final donation link once the funding platform is chosen.

## Phase 4 - Verification

- [ ] Run `bundle exec jekyll build` in an environment with Ruby/Bundler.
- [ ] Run a responsive browser pass for desktop, tablet, and mobile.
- [ ] Confirm GitHub Pages repository settings point to this site branch/folder.
