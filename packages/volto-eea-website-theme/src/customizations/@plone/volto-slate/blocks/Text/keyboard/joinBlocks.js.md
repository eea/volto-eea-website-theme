Shadow patch for #8347: Guard joinWithPreviousBlock against non-slate
previous blocks (e.g., image). Without this, getBlockEndAsRange and
mergeSlateWithBlockBackward crash because non-slate blocks have no
`value` property. See:

- https://github.com/plone/volto/issues/8347
- https://github.com/plone/volto/pull/8355

Remove this shadow once a @plone/volto-slate release containing the fix
is published and the dependency is bumped in frontend/package.json.
