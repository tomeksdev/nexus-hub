# Contributing to NexusHub Website

Thank you for your interest in contributing to the NexusHub website.

This repository contains the static Jekyll website and documentation published at:

https://nexushub.tools

For contributions to the main NexusHub application, backend, frontend dashboard, CLI, deployment code, WireGuard logic, or eBPF rules, please use the main project repository:

https://github.com/tomeksdev/NexusHub

## What You Can Contribute Here

Contributions to this website repository may include:

- Fixing typos or grammar in website content
- Improving documentation pages
- Updating links, badges, or project information
- Improving Jekyll layouts, styles, and assets
- Fixing broken links or local asset paths
- Improving accessibility, SEO, or performance

## Before You Start

Please check existing issues and pull requests before opening a new one.

For larger changes, open an issue first so the idea can be discussed before work starts.

## Development

Install dependencies and run the site locally using the commands defined in this repository.

Common workflow:

```bash
git clone https://github.com/tomeksdev/nexus-hub.git
cd nexus-hub
npm install
npm run vendor
bundle config set --local path vendor/bundle
bundle install
bundle exec jekyll serve --host 0.0.0.0 --baseurl ""
```

Then open:

```text
http://localhost:4000
```

## Pull Request Guidelines

Before opening a pull request:

- Keep changes focused and easy to review
- Use clear commit messages
- Make sure the site builds successfully
- Do not add CDN-hosted assets unless there is a good reason
- Prefer local assets already included in the repository
- Check that links and images work correctly
- Update documentation if your change affects content or navigation

## Branding

NexusHub is an open-source project.

Please do not present modified versions, forks, or separate websites as the official NexusHub project unless they are maintained by the original project author.

Acceptable examples:

- "Fork of NexusHub"
- "Based on NexusHub"
- "Unofficial NexusHub website"

Not acceptable:

- "Official NexusHub"
- "NexusHub official website"
- Using the NexusHub name or logo in a way that suggests your project is the original official project

## Security Issues

Please do not open public issues for security vulnerabilities.

For website-related security issues, see:

[SECURITY.md](SECURITY.md)

For main NexusHub application security issues, use the main project security policy:

https://github.com/tomeksdev/NexusHub/security/policy

## License

By contributing to this repository, you agree that your contributions will be licensed under the GNU General Public License v3.0.

See [LICENSE](LICENSE) for details.
