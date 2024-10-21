# volto-eea-website-theme

[![Releases](https://img.shields.io/github/v/release/eea/volto-eea-website-theme)](https://github.com/eea/volto-eea-website-theme/releases)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-eea-website-theme%2Fmaster&subject=master)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-eea-website-theme/job/master/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme-master&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme-master)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme-master&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme-master)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme-master&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme-master)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme-master&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme-master)

[![Pipeline](https://ci.eionet.europa.eu/buildStatus/icon?job=volto-addons%2Fvolto-eea-website-theme%2Fdevelop&subject=develop)](https://ci.eionet.europa.eu/view/Github/job/volto-addons/job/volto-eea-website-theme/job/develop/display/redirect)
[![Lines of Code](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme-develop&metric=ncloc)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme-develop)
[![Coverage](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme-develop&metric=coverage)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme-develop)
[![Bugs](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme-develop&metric=bugs)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme-develop)
[![Duplicated Lines (%)](https://sonarqube.eea.europa.eu/api/project_badges/measure?project=volto-eea-website-theme-develop&metric=duplicated_lines_density)](https://sonarqube.eea.europa.eu/dashboard?id=volto-eea-website-theme-develop)

EEA Website [Volto](https://github.com/plone/volto) Theme

## Upgrade

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

- If not, create one:

  ```
  npm install -g yo @plone/generator-volto
  yo @plone/volto my-volto-project --canary --addon @eeacms/volto-eea-website-theme
  cd my-volto-project
  ```

1. Install new add-ons and restart Volto:

   ```
   yarn
   yarn start
   ```

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
