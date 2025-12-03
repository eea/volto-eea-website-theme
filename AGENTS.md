# Repository Guidelines

## Project Overview

This repository contains the `volto-eea-website-theme`, a Volto addon that provides the website theme for the European Environment Agency (EEA). It includes custom components, styles, and functionality to align with the EEA's branding and requirements. The primary technologies are React (via Volto 17.20.0+), LESS for styling, and Plone 6 as the backend CMS.

## Project Structure & Modules

- `src/`: add-on source (entry: `src/index.js`, config in `src/config.js`).
- `src/components/`, `src/hooks/`, `src/helpers/`, `src/actions/`, `src/reducers/`, `src/icons/`, `src/customizations/`: feature modules.
- `theme/`: LESS/CSS overrides and assets.
- `locales/`: i18n messages.
- `cypress/`: E2E tests; config in `cypress.config.js`.
- Root tooling: `Makefile`, `jest-addon.config.js`, `razzle.extend.js`, `Dockerfile`, `docker-compose.yml`.

## File Structure

```
src/
├── components/
│   ├── theme/               # Theme-specific components
│   │   ├── Homepage/        # Homepage layouts
│   │   ├── Widgets/         # Custom widgets
│   │   ├── CustomCSS/       # Custom CSS injection
│   │   ├── DraftBackground/ # Draft mode background
│   │   ├── NotFound/        # 404 page
│   │   └── PrintLoader/     # Print functionality
│   └── manage/              # Management components
│       └── Blocks/          # Custom blocks
├── customizations/          # Volto component overrides
│   ├── volto/              # Core Volto customizations
│   └── @root/              # Root-level customizations
├── middleware/             # Express middleware
├── helpers/                # Utility functions
├── reducers/               # Redux reducers
├── slate.js                # Slate editor configuration
├── config.js               # Theme configuration
└── index.js                # Addon configuration
```

## Dependencies

- **@eeacms/volto-anchors**: Anchor link functionality
- **@eeacms/volto-block-style**: Block styling integration
- **@eeacms/volto-block-toc**: Table of contents functionality
- **@eeacms/volto-eea-design-system**: EEA design system components
- **@eeacms/volto-group-block**: Group block functionality
- **volto-subsites**: Subsite management

## Build, Test, and Development

- `make`: build Docker images for backend/frontend.
- `make start`: start Plone backend (:8080) and Volto (:3000).
- `make test` / `make test-update`: run Jest / update snapshots.
- `make cypress-open` / `make cypress-run`: open/run Cypress E2E.
- Lint/format: `make lint`, `make lint-fix`, `make stylelint[-fix]`, `make prettier[-fix]`.
- Git hooks: `yarn prepare` (runs Husky setup).

## Coding Style & Naming

- Language: JS/JSX; 2-space indent; single quotes; Prettier defaults.
- Linting: ESLint extends Volto; Stylelint for `*.css|*.less`.
- Aliases: prefer `@package`, `@plone/volto`, and `~` over deep relative paths.
- Naming: components `PascalCase.jsx`; hooks `useXxx.js`; helpers `camelCase.js`.
- Before push: `make lint-fix && make prettier-fix && make stylelint-fix`.

## Testing Guidelines

- Unit tests: Jest; place near code under `src/`; name `*.test.js[x]`.
- Coverage: thresholds defined in `jest-addon.config.js` (baseline 5%); raise when adding features.
- E2E: Cypress base URL `http://localhost:3000`; ensure stack is running (`make start`).

## Commit & Pull Request Guidelines

- Messages: imperative, concise; use types like `feat:`, `fix:`, `change(scope):`, `chore:`; reference issues (`refs #123`, `closes #123`).
- PRs: include summary, linked issues, UI screenshots for visual changes, and notes on testing. Keep scope focused.
- Ensure CI passes: lint, unit tests, and (when relevant) Cypress run.

## Security & Configuration Tips

- Backend URL via `.env` or Make variables (e.g., `RAZZLE_DEV_PROXY_API_PATH`, default `http://localhost:8080/Plone`).
- CSP/nonces support is present; review `src/config.js` if adjusting headers.
- Never commit secrets; `.env` is ignored. Use environment variables in CI.
