Shadow patch for #8347: Backspace at the start of a text block whose previous
block is not a slate block (e.g., image). See:

- https://github.com/plone/volto/issues/8347
- https://github.com/plone/volto/pull/8355

What upstream does:

- volto-slate 18.10.x has no guard in `joinWithPreviousBlock`, so
  `getBlockEndAsRange` and `mergeSlateWithBlockBackward` crash because
  non-slate blocks have no `value` property.
- volto-slate 19.x returns early when the previous block is not a slate block.
  It no longer crashes, but Backspace in an empty text block does nothing.

What this shadow adds on top of 19.x: when the current text block is empty, it
deletes it and selects the previous block. When it has text, the default Slate
behavior runs, as upstream.

Remove this shadow once Volto 18 is no longer supported, unless the
"delete the empty block" behavior is still wanted.
