# BlocksToolbar.jsx — Customization Explanation

**Upstream:** [`@plone/volto` 18.34.0 — `BlocksToolbar.jsx`](https://github.com/plone/volto/blob/18.x.x/packages/volto/src/components/manage/Form/BlocksToolbar.jsx)
**Local override:** `src/customizations/volto/components/manage/Form/BlocksToolbar.jsx`

---

## Why this override exists

Volto 18 changed how `redux-localstorage-simple` persists the `blocksClipboard` Redux slice. Instead of storing it as a single monolithic `blocksClipboard` key in `localStorage`, Volto 18's `persistentReducers` config now stores it as separate keys: `blocksClipboard.cut` and `blocksClipboard.copy`.

The upstream `loadFromStorage()` only queries for `states: ['blocksClipboard']` (the monolithic key), so after the Volto 18 migration, clipboard data stored under the new split keys is never found. On component remount or navigation, the clipboard gets wiped to `{}`, causing the paste button to disappear even though the data is still in localStorage.

## What changed

### 1. Import changes

| Upstream                                                                | Override                                                                               |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `import { load } from 'redux-localstorage-simple'`                      | _Removed_                                                                              |
| `import { cloneBlocks } from '@plone/volto/helpers/Blocks/cloneBlocks'` | _Removed_                                                                              |
| —                                                                       | `import { cloneBlocks, loadBlocksClipboardFromStorage } from './blocksClipboardUtils'` |

Both `load` and `cloneBlocks` are now provided by the local `blocksClipboardUtils.js` module instead of being imported directly from Volto.

### 2. `loadFromStorage(event)` — the core bug fix

**Upstream:**

```js
loadFromStorage() {
  const clipboard = load({ states: ['blocksClipboard'] })?.blocksClipboard;
  if (!isEqual(clipboard, this.props.blocksClipboard))
    this.props.setBlocksClipboard(clipboard || {});
}
```

**Override:**

```js
loadFromStorage(event) {
  if (event?.key && !event.key.includes('blocksClipboard')) {
    return;
  }

  const clipboard = loadBlocksClipboardFromStorage();
  const currentClipboard = this.props.blocksClipboard || {};
  const currentClipboardHasBlocks =
    currentClipboard?.cut || currentClipboard?.copy;

  if (!event && !clipboard && currentClipboardHasBlocks) {
    return;
  }

  if (!isEqual(clipboard || {}, currentClipboard)) {
    this.props.setBlocksClipboard(clipboard || {});
  }
}
```

Three improvements:

1. **Event guard** — If called from a `storage` event, returns early when the changed key is unrelated to `blocksClipboard`. Avoids unnecessary work on unrelated localStorage mutations.

2. **Volto 18 key resolution** — Delegates to `loadBlocksClipboardFromStorage()`, which tries the split-key format (`blocksClipboard.cut`/`blocksClipboard.copy`) first, then falls back to the monolithic key.

3. **Mount guard** — When called on mount (`!event`), if localStorage is empty but Redux still has clipboard data in memory, the old code would wipe Redux to `{}`. The new guard prevents losing an in-memory clipboard on remount.

### 3. `componentDidMount()` — eager rehydration

**Upstream:**

```js
componentDidMount() {
  window.addEventListener('storage', this.loadFromStorage, true);
}
```

**Override:**

```js
componentDidMount() {
  this.loadFromStorage();
  window.addEventListener('storage', this.loadFromStorage, true);
}
```

The upstream code only loads clipboard data when a `storage` event fires (typically from another browser tab). It never loads on initial mount, so the paste button is invisible until some other tab triggers a storage event. The override calls `loadFromStorage()` immediately on mount.

## What did NOT change

All other methods — `deleteBlocks`, `copyBlocksToClipboard`, `cutBlocksToClipboard`, `setBlocksClipboard`, `pasteBlocks`, `render()`, and the `connect`/`compose` wrapper — are **identical** to the Volto 18 upstream.
