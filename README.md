# NexusHub GitHub Pages

Jekyll landing page for the NexusHub project.

## Local development

```sh
npm install
npm run vendor
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll serve --host 0.0.0.0
```

With the GitHub Pages `baseurl`, open `http://localhost:4000/nexus-hub/` or `http://<host-ip>:4000/nexus-hub/`. To serve from `/` locally, use:

```sh
bundle exec jekyll serve --host 0.0.0.0 --baseurl ""
```

Bootstrap and Font Awesome are vendored into `assets/vendor/`; the page does not depend on CDNs.

If Bundler fails with missing Ruby headers, install the Ruby development packages first:

```sh
sudo apt update
sudo apt install -y ruby-dev build-essential zlib1g-dev
```
