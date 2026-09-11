Shadow patch for #8347: Fix cursor position after mergeSlateWithBlockBackward
when merging two same-type blocks. Slate normalization merges adjacent text
nodes, making the original cursor path invalid. See:

- https://github.com/plone/volto/issues/8347
- https://github.com/plone/volto/pull/8355

Remove this shadow once a @plone/volto-slate release containing the fix
is published and the dependency is bumped in frontend/package.json.
