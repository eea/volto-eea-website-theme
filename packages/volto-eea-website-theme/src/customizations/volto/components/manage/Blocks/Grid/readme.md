These two customizations ensure backward compatibility with the legacy @kitconcept/volto-blocks-grid. For more details, refer to the ticket here: https://taskman.eionet.europa.eu/issues/265726.
Also, if there is an empty block, it will convert to slate, so the "Unkown block" message will not appear

`Edit.jsx` is based on Volto 19.5.0 (identical to 18.36.0): the selected child
block is kept in the Redux form UI state (`form.ui.gridSelected`), as in core.
The only EEA change is the `teaserGrid` → `gridBlock` conversion, which renders
the converted data right away and saves it with `onChangeBlock` from an effect.
