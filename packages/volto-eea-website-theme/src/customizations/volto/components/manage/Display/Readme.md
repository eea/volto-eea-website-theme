Added customization to condition the display of the layout options based on the user's roles.

The shadow is the Volto 19.5.0 core `Display.jsx` (hooks version, identical in
Volto 18.36.0) with one EEA change: the layout selector renders only for users
that have one of the roles in `config.settings.eea.rolesWhoCanChangeLayout`
(set in `volto-eea-website-policy`). Otherwise the component renders nothing.

- The roles are read from `state.users.user.roles`.
- When `state.users.user` is empty, the user is fetched with `getUser`, using
  the id from `jwtDecode(state.userSession.token).sub`. A missing or invalid
  token gives no user id: nothing is fetched and the selector stays hidden.

`Display.jsx.diff` shows the changes against core. When upgrading Volto, start
again from the new core file and re-apply only the role check.
