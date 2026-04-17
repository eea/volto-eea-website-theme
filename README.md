# volto-eea-website-theme

[![Releases](https://img.shields.io/github/v/release/eea/volto-eea-website-theme)](https://github.com/eea/volto-eea-website-theme/releases)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-eea-website-theme%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-eea-website-theme/job/master/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-eea-website-theme%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-eea-website-theme/job/develop/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme&branch=develop&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme&branch=develop)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme&branch=develop&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme&branch=develop)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme&branch=develop&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme&branch=develop)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme&branch=develop&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme&branch=develop)

EEA Website [Volto](https://github.com/plone/volto) Theme

## Upgrade

### Upgrading to ^4.1.x

* This version requires `^eea.volto.policy@12.0`

### Upgrading to 3.x.x

* This version removes some Volto customizations and it requires **Volto 17.20.0+**. See [CHANGELOG.md](https://github.com/eea/volto-eea-website-theme/blob/master/CHANGELOG.md)

## Demo

- https://www.eea.europa.eu

## Docusaurus and Storybook

See [Docusaurus](https://eea.github.io/).
See [Storybook](https://eea.github.io/eea-storybook/).

## Volto customizations

- `volto-slate/elementEditor/utils` -> https://github.com/plone/volto/pull/5926

- `volto-slate/editor/SlateEditor` -> When two slates looks at the same prop changing one slate and updating the other should be handled properly. This change makes replacing the old value of slate work in sync with the other slates that watches the same prop [ref](https://taskman.eionet.europa.eu/issues/264239#note-11).

  **!!IMPORTANT**: This change requires volto@^16.26.1

- `volto/components/manage/Sidebar/SidebarPopup` -> https://github.com/plone/volto/pull/5520
- `volto/components/manage/Form/Form.jsx` -> Pass errors of metadata validation to BlocksForm
- `volto/components/manage/Blocks/Block/BlocksForm.jsx` -> Pass errors of metadata validation to blocks.

## Getting started

### Try volto-eea-website-theme with Docker

      git clone https://github.com/eea/volto-eea-website-theme.git
      cd volto-eea-website-theme
      make
      make start

Go to http://localhost:3000

`make start` now defaults to Volto 18. To run the same setup against Volto 17, use:

      VOLTO_VERSION=17 make
      VOLTO_VERSION=17 make start

### Add volto-eea-website-theme to your Volto project

1. Make sure you have a [Plone backend](https://plone.org/download) up-and-running at http://localhost:8080/Plone

   ```Bash
   docker compose up backend
   ```

1. Start Volto frontend

- If you already have a volto project, just update `package.json`:

  ```JSON
  "addons": [
      "@eeacms/volto-eea-website-theme"
  ],

  "dependencies": {
      "@eeacms/volto-eea-website-theme": "*"
  }
  ```

- If not, create one with Cookieplone, as recommended by the official Plone documentation for Volto 18+:

  ```
  uvx cookieplone project
  cd project-title
  ```

1. Install or update dependencies, then start the project:

   ```
   make install
   ```

   For a Cookieplone project, start the backend and frontend in separate terminals:

   ```
   make backend-start
   make frontend-start
   ```

   For a legacy Volto 17 project, install the package with `yarn` and restart the frontend as usual.

1. Go to http://localhost:3000

1. Happy editing!

## Release

See [RELEASE.md](https://github.com/eea/volto-eea-website-theme/blob/master/RELEASE.md).

## How to contribute

See [DEVELOP.md](https://github.com/eea/volto-eea-website-theme/blob/master/DEVELOP.md).

## Copyright and license

The Initial Owner of the Original Code is European Environment Agency (EEA).
All Rights Reserved.

See [LICENSE.md](https://github.com/eea/volto-eea-website-theme/blob/master/LICENSE.md) for details.

## Funding

[European Environment Agency (EU)](http://eea.europa.eu)
