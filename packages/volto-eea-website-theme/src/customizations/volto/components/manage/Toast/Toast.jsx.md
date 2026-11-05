# Toast.jsx customization

This customization shadows Volto core's
`src/components/manage/Toast/Toast.jsx`. It is the Volto 19.5.0 core component
with the toast rendered for the EEA Design System (#294806):

- Rendered as a semantic-ui `Message` (`icon`, `size="large"` and the
  `info`/`success`/`error`/`warning` props), with the classes
  `eea-toast eea-toast--<status>`. Without a status prop it uses `success`,
  like the core icon does. Styled by `customizations/@root/toast.less`
  (`.ui.message.eea-toast`, `.toast-inner-content`).
- The title is a `Message.Header`, the body is in
  `Message.Content.toast-inner-content`.
- The icon is the Semantic `exclamation circle` for every status, as in the
  EEA Design System `Message` component, instead of the per-status Volto SVGs.

Kept from core: the screen reader label of the toast type (`toast_type_*`
messages), in a visually hidden span. Volto 18 names that class
`visually-hidden-volto` and Volto 19 `visually-hidden`, so the shadow picks it
with `isVolto18`. Use `visually-hidden` only once Volto 18 is no longer
supported.

`Toast.jsx.diff` shows the changes against core.
