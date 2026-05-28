# Sharing.jsx customization

This customization shadows Volto core's
`src/components/manage/Sharing/Sharing.jsx` from `@plone/volto`.

## Changes

- **Null-safe access to `state.content.data.title`**: The original code
  accesses `state.content.data.title` directly, which throws a `TypeError:
  Cannot read properties of null (reading 'title')` when `state.content.data`
  is `null` (e.g., when the content hasn't loaded yet, or when SSR renders a
  page where the content API returned an error/null).

  Fix: `state.content.data.title` → `state.content.data?.title || ""`

## Sentry issue

- [440198](https://sentry.eea.europa.eu/organizations/eea/issues/440198/) —
  `TypeError: Cannot read properties of null (reading 'title')` — 1,253 events

## When upgrading Volto

Compare the new core `Sharing.jsx` `mapStateToProps` with this override.
If upstream adds more `state.content.data.*` references, apply optional
chaining to those as well.