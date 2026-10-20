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

### 2. `loadFromStorage(event)` — cross-tab sync only

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

  const clipboard = loadBlocksClipboardFromStorage() || {};
  if (!isEqual(clipboard, this.props.blocksClipboard || {})) {
    this.props.setBlocksClipboard(clipboard);
  }
}
```

1. **Event guard** — returns early when the changed `storage` key is unrelated to `blocksClipboard`.

2. **Volto 18 key resolution** — delegates to `loadBlocksClipboardFromStorage()`, which reads only the keys listed in `config.settings.persistentReducers` (`blocksClipboard.cut`/`blocksClipboard.copy` in Volto 18, `blocksClipboard` in Volto 17). A leftover Volto 17 `blocksClipboard` key is never updated by Volto 18, so it is ignored instead of being used as a fallback.

### 3. `componentDidMount()` — no reload on mount

`componentDidMount()` is identical to upstream: it only registers the `storage` listener. The clipboard must **not** be reloaded from localStorage on mount:

- the store already rehydrates the clipboard from localStorage when it is created;
- `redux-localstorage-simple` saves with a 500ms debounce that restarts on every Redux action (hovering blocks dispatches `setUIState`), so right after a cut/copy localStorage can still hold an older clipboard.

Reloading on mount (e.g. when a container block's nested `BlocksToolbar` mounts on selection) used to overwrite the fresh cut/copy with that stale value, which made the paste button disappear.

## What did NOT change

All other methods — `componentDidMount`, `deleteBlocks`, `copyBlocksToClipboard`, `cutBlocksToClipboard`, `setBlocksClipboard`, `pasteBlocks`, `render()`, and the `connect`/`compose` wrapper — are **identical** to the Volto 18 upstream.
