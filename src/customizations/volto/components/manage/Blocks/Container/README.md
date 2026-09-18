# Container editor multiselection

Overrides Volto's Container editor and cell wrapper to support Shift ranges and
Ctrl/Cmd toggle selection for inner cards. The active card seeds additive
selection. Plain clicks and container settings reset the multi-selection.

The selected container mounts the shared BlocksToolbar with its own form data,
so clipboard actions operate on children and use the existing nested-toolbar
ownership mechanism. Complete block/layout updates are merged into the container.

The cell wrapper preserves modifier keys on cell padding clicks. It lets the
standard Block/Edit wrapper handle card-body clicks, avoiding a second selection
callback that would clear ranges or toggle additive selection twice.

Grid/Edit imports this editor directly. Regression coverage is in
qa/ticket-308383/containers.audit.jsx and browser-nested.cjs in the frontend repo.
The browser cases cover root and Section-nested cards, copy inside, export to
page root, and save/reload.
