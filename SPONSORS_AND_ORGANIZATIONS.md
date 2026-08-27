# RRM multi-organization branding and sponsors

## Add a new organization
1. Copy `organizations/_template/` to `organizations/<slug>/`.
2. Put the main logo and sponsor logos in that folder's `assets/` directory.
3. Edit `config.json` for organization and issue metadata.
4. Edit `branding.json` for logo, colors, and fonts. Start from one of the preset names: `classic`, `clinical`, `community`, or `premium`.
5. Edit `sponsors.json`. No React/TypeScript changes are required.

Use `?org=<slug>` for standalone selection. `?brand=<preset>` previews another preset without changing files. `?issue=<issue-slug>` supports an optional `organizations/<slug>/issues/<issue-slug>/branding.json` override.

WordPress may pass `organizationSlug`, `brandingVariant`, and `issueSlug`; WordPress-provided data URLs continue to take priority over standalone GitHub URLs.
