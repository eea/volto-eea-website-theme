# Form.jsx — Customization explanation

**Upstream:** `@plone/volto` 18.35.1, `components/manage/Form/Form.jsx`  
**Local override:** `src/customizations/volto/components/manage/Form/Form.jsx`

## Why this override exists

Volto's top-level Control/Meta selection handler tests whether
`this.state.selected` is already in `uiState.multiSelected`. `selected` is not a
member of the component's local state; the active block is stored in
`this.props.uiState.selected`.

After the first Control/Meta selection, the handler consequently appends the
now-null active selection on every subsequent click. This creates states such
as:

```js
multiSelected: ['block-a', 'block-b', null, 'block-c', null]
```

The null entries can leave clipboard controls visible when no block is visibly
selected and provide invalid anchors to later selection operations.

## What changed

The Control/Meta branch now:

1. Reads the active block from `this.props.uiState.selected`.
2. Adds that non-null active block once when starting a multi-selection.
3. Adds an unselected clicked block without duplicates.
4. Removes only a clicked block that was already in `multiSelected`.

The class is also exported as a named export solely so the real
`onSelectBlock` method can be exercised directly by the focused regression
test. The connected default export is unchanged.

Together with the `Block/Edit.jsx` customization, a modified click on the
active block promotes it to a one-block multi-selection.

## Preserved behavior

- Ordinary click selects one block and clears multi-selection.
- Control/Meta-click adds or removes individual blocks.
- Shift-click selects the contiguous range from the active block or first
  multi-selection member.
- Removing the final member produces an empty array, so clipboard controls
  disappear.
- Nested containers continue to own their local selection state.
- Order-sidebar behavior is unchanged.

Reassess this override whenever Volto is upgraded. Remove it when upstream
provides equivalent selection behavior and no longer introduces null entries.
