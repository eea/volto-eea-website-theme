# actions.js customization

This customization shadows Volto core's `src/reducers/actions/actions.js` from
`@plone/volto` 18.36.0.

The functional change is a single guard on `GET_CONTENT_SUCCESS`:

```diff
-      if (hasExpander && !action.subrequest) {
+      if (hasExpander && !action.subrequest && action.result['@components']) {
```

## Why

`hasApiExpander('actions', path)` only checks `config.settings.apiExpanders`.
The default expander has `match: ''`, so it matches every path, while the
backend only sends `@components` for content objects. `GET_CONTENT_SUCCESS` is
also dispatched for endpoints that are not content objects:

- `/@@search`, `/fr/@@search`
- `/en/about/view`
- `.../mail_password_form`

For those, `action.result['@components']` is `undefined` and the reducer threw
`TypeError: Cannot read properties of undefined (reading 'actions')` while
Redux was dispatching, breaking the page.

Sentry: `WWW-EEA-EUROPA-EU-EN-3`, `-28`, `-1AT`, `-1F` — 70k+ events in the
14 days before 2026-11-02, still firing on release 7.0.1. Triage details in
the EEA `sentry-triage` skill (noise taxonomy).

The test next to this file (`actions.test.js`) covers both paths: a
`GET_CONTENT_SUCCESS` without `@components` keeps the state, one with
`@components` stores the actions.

## Upstream

The same unguarded line exists in Volto 19
(`volto19/packages/volto/src/reducers/actions/actions.js`), so this is an
upstream fix candidate; the patch is the one-liner above plus a test case.
When/if upstream fixes it, delete this customization and `actions.js.diff`.

When upgrading Volto, compare the new core reducer with this override and
refresh `actions.js.diff` if core changed around the `GET_CONTENT_SUCCESS`
branch.
