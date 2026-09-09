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

## Nested container blocks

Container blocks (Group, Columns, Grid, Tabs, Accordion) render their children in a nested `BlocksForm` (root element `.blocks-form`). React synthetic `mousedown`, `focus` (focusin) and `click` events from a child bubble through the container's own `.block` element, and the nested `BlocksForm` only stops propagation for keydown. Without a guard, every interaction with a child block also:

- selected the container in the page-level form (focus/click bubbling, a pre-existing core behavior), and
- with the modified-click forwarding above, added or removed the container from the page-level multi-selection, or started a page-level Shift range, whenever a child was Meta/Control/Shift-clicked.

The override recognizes `mousedown`, `click`, and `focus` events whose target is inside a `.blocks-form` rendered by the block itself:

```jsx
isNestedFormEvent = (event) => {
  const node = this.blockNode.current;
  if (!node || !event?.target?.closest) {
    return false;
  }
  const nestedForm = event.target.closest('.blocks-form');
  return !!nestedForm && node.contains(nestedForm);
};
```

The check is descendant-scoped: for non-container blocks the nearest `.blocks-form` is an ancestor of the block (the page form), so their own events are always handled. For a nested event, the container ignores mousedown focus suppression and never applies the child's modifier keys to page-level selection. If the container is not active, click/focus activates it as a single page-level selection because Group and Columns intentionally render child selection and their nested toolbar only while the parent container is active. The raw child event is not forwarded during that activation: Group and Columns recompute modifier state from the event instead of trusting the explicit selection argument, which would otherwise multi-select the ancestor. If the container is already active, the event does not change page-level selection. The nested form remains responsible for selecting or multi-selecting the child.

Clicks and focus on the container's own chrome (header, drag handle, add-block area) continue through the ordinary handler, including active-block promotion.

## Volto 17 and 18 compatibility

The override imports `BlockSettingsSidebar` from the public `@plone/volto/components` barrel shared by Volto 17 and 18. Importing Volto 18's deep `Block/Settings` module directly creates a circular initialization path in Volto 17 (`Settings` → `BlockDataForm` → the components barrel) and crashes the server while resolving `InlineForm` before Cypress can start. The other components retain Volto 18's preferred direct imports.

Volto 17 also has no `setUIState` action or `form.ui` state. The local compatible action and `formUI` fallback preserve hover state on Volto 17 while continuing to use `form.ui` on Volto 18.

## Preserved behavior

- Ordinary mouse clicks can still focus and select blocks.
- Keyboard focus still selects blocks for keyboard navigation.
- Mousedown on the singly selected block (`selected === true`) is unchanged.
- A modified click on the singly selected block promotes it to multi-selection.
- Clicking a block inside a container keeps the container singly active at page level so the nested editor is available, while selection and modifier semantics apply to the child in the container-local form.
- Nested child clicks never promote the container to page-level multi-selection or start a page-level Shift range.
- The container's own chrome (outside the nested form) still selects the container, including modified clicks on the active container.
- Existing Shift, Control, and Meta range/toggle logic remains owned by each `BlocksForm` consumer.
- Order-sidebar behavior is intentionally unchanged.

The override should be removed when an equivalent fix is available in the supported Volto version.
