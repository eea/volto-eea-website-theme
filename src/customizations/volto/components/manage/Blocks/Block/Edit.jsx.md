# Block/Edit.jsx — Customization explanation

**Upstream:** `@plone/volto` 18.35.1, `components/manage/Blocks/Block/Edit.jsx`  
**Local override:** `src/customizations/volto/components/manage/Blocks/Block/Edit.jsx`

## Why this override exists

Volto selects an unselected block both on focus and on click. A modified mouse action is dispatched in this order:

1. `mousedown`
2. browser focus
3. `focus`
4. `mouseup`
5. modified `click`

The focus event ordinarily selects the block before the modified click arrives. The click handler then sees an already selected block and does not forward the Shift, Control, or Meta selection to the containing `BlocksForm`.

This prevents container-local clipboard toolbars from receiving multi-selection in Group, Columns, Tabs, and Accordion blocks.

Upstream also ignores every click on the currently active block. As a result, a Control/Meta-click cannot promote that block into a one-block multi-selection, making the same gesture behave differently depending on whether focus selected the block first.

## What changed

The override prevents the browser's focus default only for a modified mousedown on an unselected block:

```jsx
onMouseDown={(event) => {
  const isMultipleSelection =
    event.shiftKey || event.ctrlKey || event.metaKey;
  if (!this.props.selected && isMultipleSelection) {
    event.preventDefault();
  }
}}
```

The click handler now also forwards modified clicks on the active block. Ordinary clicks on the active block remain ignored. The containing selection handler can therefore promote the active block to multi-selection without changing ordinary editing behavior.

## Preserved behavior

- Ordinary mouse clicks can still focus and select blocks.
- Keyboard focus still selects blocks for keyboard navigation.
- Mousedown on the singly selected block (`selected === true`) is unchanged.
- A modified click on the singly selected block promotes it to multi-selection.
- Existing Shift, Control, and Meta range/toggle logic remains owned by each `BlocksForm` consumer.
- Order-sidebar behavior is intentionally unchanged.

The override should be removed when an equivalent fix is available in the supported Volto version.
