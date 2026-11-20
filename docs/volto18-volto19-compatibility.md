# Volto 18 / Volto 19 compatibility layer

The `volto19` branch of `volto-eea-website-theme` is built from one source tree
that must compile and run on both Volto 18 and Volto 19:

- `package.json` declares `"@plone/volto": ">=18.0.0 <20.0.0"`.
- Jenkins builds and tests the add-on against both versions
  (`CURRENT_VOLTO = "19"`, `PREVIOUS_VOLTO = "18"`).

Most shadows are rebased on Volto 19.5.0. A few Volto 19 APIs do not exist in
Volto 18, and webpack fails the whole build on a single missing import. The
code listed below works around that. It is temporary: once Volto 18 is no
longer supported it should be removed, following the steps at the end of
this document.

## Why the code cannot simply be removed today

A shadow is a single file that replaces the core one on every Volto version.
It cannot import a module that one of the supported versions lacks, and it
has to work with the component that renders it, which differs between
versions (for example the contents view uses react-dnd on Volto 18 and
dnd-kit on Volto 19).

There are two ways to get rid of this layer:

1. **Drop Volto 18 support** (recommended once no site needs it): remove the
   `Volto 18` stage from the `Jenkinsfile`, raise the peer dependency to
   `>=19.0.0`, and apply the removal steps below.
2. **Keep separate branches**: keep Volto 18 releases on another branch and
   make `volto19` Volto 19 only. This duplicates every future fix, so option 1
   is preferable.

## Runtime version check

| File | Purpose |
|---|---|
| `src/helpers/voltoVersion.js` | Exports `isVolto18`, read from `@plone/volto/../package.json` (the same approach as the `VersionOverview` shadow in `volto-controlpanel`). Used where a shadow must behave differently at runtime. |

## Local copies of Volto 19 helpers

These helpers exist in Volto 19 core but not in Volto 18. The theme keeps a
copy and the shadows import the copy instead of the core module.

| Local file | Volto 19 original | Used by | Notes |
|---|---|---|---|
| `src/helpers/isIMEComposing.js` | `isIMEComposing` in `@plone/volto/helpers/Utils/Utils` | `customizations/@plone/volto-slate/editor/SlateEditor.jsx` | Ignores Enter/keys while an IME composition (e.g. CJK input) is active. |
| `src/helpers/addSubpathPrefix.js` | `addSubpathPrefix` in `@plone/volto/helpers/Url/Url` | `customizations/volto/components/theme/Image/Image.jsx`, `customizations/volto/helpers/Html/Html.jsx` | Prefixes internal URLs with `settings.subpathPrefix`. |
| `src/helpers/withSaveAsDraft.jsx` | `@plone/volto/helpers/Utils/withSaveAsDraft` (Volto 19.5.0) | `customizations/volto/components/manage/Form/Form.jsx` | Edit form autosave in `localStorage`. Only active on Volto 19, when `config.experimental.saveAsDraft.enabled` is set; always off on Volto 18. `volto-eea-website-policy` enables it. Tested in `src/helpers/withSaveAsDraft.test.jsx`. |

## Shadows with a per-version implementation

### `ContentsItem`

`customizations/volto/components/manage/Contents/ContentsItem.jsx` only picks
an implementation with `isVolto18`:

| Volto | Component | Drag and drop |
|---|---|---|
| 18 | `src/components/manage/Contents/ContentsItemReactDnd.jsx` | react-dnd, provided by the Volto 18 `Contents.jsx` |
| 19 | `src/components/manage/Contents/ContentsItemDndKit.jsx` | dnd-kit, provided by the Volto 19 `Contents.jsx` |

Both carry the same EEA changes (expired/scheduled badges computed once, title
allowed to shrink so it does not overlap the badges). A single file cannot
serve both versions because each `Contents.jsx` only provides the context of
its own drag-and-drop library. `ContentsItem.jsx.diff` documents the Volto 19
variant against core.

## Volto 19 settings missing on Volto 18

`customizations/volto/server.jsx` is based on Volto 19, which builds the
detected `apiPath` and `publicURL` as `host + settings.subpathPrefix`. Volto 18
does not define `settings.subpathPrefix`, so the shadow falls back to `''`.
Without the fallback the client received `http://<host>undefined` as
`apiPath`: every client API request failed with "Invalid URL", the
`useUser` hook retried `GET_USER` in a tight loop, and the edit page froze
(this is what hung the Volto 18 Cypress run on its first spec). Drop the
fallback once Volto 18 is no longer supported.

## Volto 19 features left out of shadows

These shadows stay on the Volto 18-compatible code, so they miss a Volto 19
improvement. The effect is limited to Volto 19 sites.

| Shadow | Missing Volto 19 change | Effect on Volto 19 |
|---|---|---|
| `customizations/volto/components/manage/Blocks/Grid/View.jsx` | `GridContext.Provider` from `@plone/volto/components/manage/Blocks/Grid/context` | Teasers inside a Grid block do not know the number of columns, so their images use the default `sizes` instead of a per-column value. Display is unaffected. |
| `customizations/volto/components/theme/View/DefaultView.jsx` | Rendering fieldsets with `@plone/volto/components/theme/FieldsetView/FieldsetView` | For content types without blocks, the `frontendOptions` schema hint of a field is not honored in view mode. |

## Removing the layer when Volto 18 support is dropped

1. `SlateEditor.jsx`: import `isIMEComposing` from
   `@plone/volto/helpers/Utils/Utils`; delete `src/helpers/isIMEComposing.js`.
2. `Image.jsx` and `Html.jsx`: import `addSubpathPrefix` from
   `@plone/volto/helpers/Url/Url`; delete `src/helpers/addSubpathPrefix.js`.
3. `Form.jsx`: import `withSaveAsDraft` from
   `@plone/volto/helpers/Utils/withSaveAsDraft`; delete
   `src/helpers/withSaveAsDraft.jsx` and its test. Update `Form.jsx.md`.
4. `ContentsItem.jsx`: replace the shadow with the content of
   `src/components/manage/Contents/ContentsItemDndKit.jsx`; delete both
   variants in `src/components/manage/Contents/`. Update `ContentsItem.jsx.md`.
5. `Grid/View.jsx`: wrap the grid in
   `<GridContext.Provider value={columns?.length}>`.
6. `DefaultView.jsx`: render the fieldsets with `FieldsetView`, as Volto 19
   core does.
7. Delete `src/helpers/voltoVersion.js` once nothing imports it.
8. `server.jsx`: the `subpathPrefix || ''` fallback can go.
9. Regenerate the `.diff` files of the touched shadows against the new Volto
   version.
10. In `volto-eea-website-policy`, the
   `if (config.experimental?.saveAsDraft)` guard around the autosave flag can
   become a plain assignment.

## Volto 17 leftovers

The peer dependency already excludes Volto 17, but some Volto 17 fallbacks are
still in the code. They are harmless on Volto 18 and 19 and can be removed
independently of the steps above:

- `customizations/volto/components/manage/Blocks/Block/Edit.jsx` and
  `.../Blocks/Block/Order/Item.jsx`: local `setUIState` action creator; import
  it from `@plone/volto/actions/form/form` instead.
- `src/reducers/formUI.js` (registered in `src/index.js`): fallback store for
  `SET_UI_STATE`, redundant since Volto 18.
- `customizations/volto/components/manage/Sidebar/SidebarPopup.jsx`: backport
  of plone/volto#5520, identical to core since Volto 18.
- `customizations/volto/components/manage/Widgets/ObjectBrowserWidget.jsx`:
  local `validateExternalUrl`; Volto 18 and 19 provide `urlValidator` in
  `@plone/volto/helpers/FormValidation/validators`.
