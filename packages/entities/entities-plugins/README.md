# @kong-ui-public/entities-plugins

Plugin entity components.

- [Requirements](#requirements)
- [Included components](#included-components)
- [Usage](#usage)
  - [Install](#install)
  - [Registration](#registration)
- [Individual component documentation](#individual-component-documentation)

## Requirements

> [!CAUTION]
> A string of 'undefined' is disallowed in Plugin icon names

- `vue` and `vue-router` must be initialized in the host application
- `@kong/kongponents` must be added as a dependency in the host application, globally available via the Vue Plugin installation, and the package's style imports must be added in the app entry file. [See here for instructions on installing Kongponents](https://kongponents.konghq.com/#globally-install-all-kongponents).
- `@kong-ui-public/i18n` must be available as a `dependency` in the host application.
- `axios` must be installed as a dependency in the host application

## Included components

- `PluginList`

Reference the [individual component docs](#individual-component-documentation) for more info.

## Usage

### Install

Install the component in your host application

```sh
yarn add @kong-ui-public/entities-plugins
```

### Registration

Import the component(s) in your host application as well as the package styles

```ts
import { PluginList, PluginSelect, PluginForm, PluginConfigCard } from '@kong-ui-public/entities-plugins'
import '@kong-ui-public/entities-plugins/dist/style.css'
```

## Individual component documentation

- [`<PluginList.vue />`](docs/plugin-list.md)
- [`<PluginSelect.vue />`](docs/plugin-select.md)
- [`<PluginForm.vue />`](docs/plugin-form.md)
- [`<PluginConfigCard.vue />`](docs/plugin-config-card.md)
