# Volto 18 Shadow Audit for `volto-eea-website-theme`

## Baseline

- Project baseline: Volto 17.23.0 from `frontend/omelette`
- Upgrade target: Volto 18.32.4 from `volto/packages/volto` and `volto/packages/volto-slate`
- External addon in scope: `frontend/src/addons/volto-block-style` 9.0.0

## Summary

- The risky upgrade surface is concentrated in a few areas: server/CSP, image and lead-image blocks, sidebar/object browser, toolbar/history/workflow, and the EEA header/view stack.
- Only one runtime shadow is already absorbed by Volto 18 and should be removed directly: `@plone/volto-slate/elementEditor/utils.js`.
- Several shadows are path-level API moves rather than pure behavior conflicts: image schema (`.js` to `.jsx`), `UniversalLink` (`.jsx` to `.tsx`), and lead-image schema/alignment logic being folded into the sidebar/edit flow.
- Some shadows are still conceptually valid on Volto 18 because upstream barely changed: grid compatibility, number parsing, footer metadata tweaks, image rendering helpers, password reset copy, and CSP-related HTML rendering.

## Status Vocabulary

- `compatible`: local customization still fits Volto 18 with only a sync check
- `needs rebase`: Volto 18 changed enough that the shadow should be rebased, not copied forward blindly
- `upstream absorbed`: the Volto 18 file already contains the behavior; remove the shadow
- `moved/renamed`: the Volto 18 counterpart exists at a different file or in a different component shape
- `candidate removal`: not part of the runtime contract anymore or appears to be leftover support material
- `external addon follow-up`: valid shadow, but against another addon rather than Volto core

## Highest-Risk Areas

1. `volto/server.jsx` and `volto/helpers/Html/Html.jsx`
   These implement CSP headers, nonces, and script extraction. Volto 18 changed SSR/server internals enough that this pair should be rebased together.
2. `volto/components/manage/Blocks/Image/*` and `volto/components/manage/Blocks/LeadImage/*`
   Volto 18 reorganized image/lead-image editing, including schema and sidebar responsibilities. These cannot be ported file-for-file.
3. `volto/components/manage/Sidebar/*`, `.../Widgets/ObjectBrowserWidget.jsx`, and `.../Toolbar/More.jsx`
   Volto 18 changed object browser and editorial navigation substantially. Image preview, alt defaults, and menu links all need a fresh merge.
4. `volto/components/theme/Header/*`, `.../View/*`, and `.../Footer/Footer.jsx`
   These are large EEA-branded forks with small upstream deltas in some files and meaningful behavioral deltas in others. They need selective cherry-picking, not a blanket replace.

## Runtime Audit Matrix

### `@eeacms` and `@plone/volto-slate`

| Shadow | Why customized in 17 | Volto 18 delta | Status | Next action | Support |
| --- | --- | --- | --- | --- | --- |
| `@eeacms/volto-block-style/StyleWrapper/schema.js` | Reduces style wrapper schema to EEA preset-only UI. | No local addon delta between 17 and 18 baseline in this repo. | `external addon follow-up` | Keep as-is for the Volto 18 pass; verify against the addon release used by the final project. | Changelog entry for StyleWrapper |
| `@plone/volto-slate/blocks/Table/TableBlockView.jsx` | Ensures public table rendering matches EEA slate styling. | Upstream changed only slightly. | `compatible` | Keep the shadow, then run a visual regression check on public table markup. | Inline TODO only |
| `@plone/volto-slate/blocks/Text/TextBlockView.jsx` | Keeps EEA-specific text block rendering and text style variants. | Small upstream delta. | `compatible` | Keep, then re-check custom marks/classes after upgrade. | None |
| `@plone/volto-slate/editor/SlateEditor.jsx` | Fixes multiple editors bound to the same prop and carries custom hotkey behavior. | Moderate upstream editor changes in Volto 18. | `needs rebase` | Rebase the same-prop sync fix and hotkey changes onto Volto 18 instead of copying the whole file. | README note in addon root, changelog refs `#264239` |
| `@plone/volto-slate/editor/plugins/Table/less/public.less` | EEA table public styling override. | No upstream delta. | `compatible` | Keep. | None |
| `@plone/volto-slate/editor/render.jsx` | Adds anchor link rendering and custom slate render behavior. | Small upstream delta. | `needs rebase` | Rebase custom anchor rendering on top of Volto 18 render helpers. | Changelog note for `renderLinkElement` |
| `@plone/volto-slate/elementEditor/utils.js` | Historical slate editing fix. | Volto 18 file is identical to the customization. | `upstream absorbed` | Remove the shadow. | README and changelog point to upstreamed work |
| `@plone/volto-slate/utils/blocks.js` | Empty-block and copy/paste handling for slate block transforms. | Volto 18 changed block utilities. | `needs rebase` | Re-implement only the transform behavior still needed for `#273976`, `#261770`, and Word paste fixes. | Changelog refs `#273976`, `#265782`, `#261770` |
| `@root/theme.js` | Replaces default semantic import with EEA design-system semantic theme plus Pastanaga extras. | Volto 18 root theme entry is materially the same. | `compatible` | Keep, verify the design-system LESS still builds on Volto 18. | None |

### Core actions, reducers, helpers, and server

| Shadow | Why customized in 17 | Volto 18 delta | Status | Next action | Support |
| --- | --- | --- | --- | --- | --- |
| `volto/actions/vocabularies/vocabularies.js` | Backports a newer vocabulary-fetch implementation from Volto 19.x. | Volto 18 target file is unchanged vs 17 for this area. | `compatible` | Keep for now; later compare directly with Volto 19 before removing. | `vocabularies.js.md`, `.diff`, test shadow |
| `volto/helpers/Html/Html.jsx` | CSP-safe HTML rendering. | Volto 18 changed the helper enough to require a real merge. | `needs rebase` | Rebase the CSP behavior onto Volto 18 helper code, then verify nonce/script extraction end-to-end. | `Readme.md` |
| `volto/reducers/breadcrumbs/breadcrumbs.js` | Supports custom breadcrumb behavior used by EEA header/view stack. | Small upstream delta. | `needs rebase` | Keep only the breadcrumb-state changes still required by the custom header and breadcrumbs components. | None |
| `volto/server.jsx` | CSP headers, nonce generation, language-aware redirects, and script extraction on error pages. | Volto 18 server changed heavily. | `needs rebase` | Rebuild this customization against Volto 18 server entry instead of copying the file; test SSR, CSP, and error pages together. | Inline comments; paired with `Html.jsx` |

### Manage UI: blocks

| Shadow | Why customized in 17 | Volto 18 delta | Status | Next action | Support |
| --- | --- | --- | --- | --- | --- |
| `volto/components/manage/Blocks/Grid/Edit.jsx` | Backward compatibility with legacy `@kitconcept/volto-blocks-grid`. | Small upstream delta. | `compatible` | Keep the compatibility layer and smoke-test old grid content. | `readme.md` |
| `volto/components/manage/Blocks/Grid/View.jsx` | Backward compatibility with legacy `@kitconcept/volto-blocks-grid`. | Small upstream delta. | `compatible` | Keep and verify old serialized grid data still renders. | `readme.md` |
| `volto/components/manage/Blocks/Image/Edit.jsx` | EEA image editor UX, object browser preview, copyright fields, link settings, and custom scales. | Volto 18 image editor changed a lot. | `needs rebase` | Rebase behavior onto Volto 18 `Edit.jsx` and `ImageSidebar.jsx`; do not carry the old structure forward. | `Edit.test.jsx`, paired schema/view shadows |
| `volto/components/manage/Blocks/Image/View.jsx` | EEA image rendering, preview-image links, copyright overlays, and custom link handling. | Moderate upstream delta. | `needs rebase` | Rebase onto Volto 18 view component and keep only rendering differences still needed. | Paired image schema/edit shadows |
| `volto/components/manage/Blocks/Image/schema.js` | Adds copyright fieldset, icon selection, and object-browser link settings. | Volto 18 counterpart moved to `schema.jsx` and now feeds `ImageSidebar.jsx`. | `moved/renamed` | Port only the extra schema fields to Volto 18 `schema.jsx`; remove the old path shadow. | Paired image shadows |
| `volto/components/manage/Blocks/LeadImage/AlignChooser.jsx` | Historical alignment UI override for lead image. | No standalone counterpart in Volto 18. | `moved/renamed` | Check whether the customization is obsolete because alignment is now handled in sidebar/edit flow; remove unless a missing control is confirmed. | Test and snapshot shadow exist |
| `volto/components/manage/Blocks/LeadImage/Edit.jsx` | EEA lead-image editing and schema wiring. | Volto 18 lead-image edit changed significantly. | `needs rebase` | Rebase onto Volto 18 `Edit.jsx` and use the new sidebar/data flow. | Paired with sidebar/view/schema shadows |
| `volto/components/manage/Blocks/LeadImage/LeadImageSidebar.jsx` | EEA lead-image sidebar with custom fields and behavior. | Small upstream delta, but the surrounding edit flow changed. | `needs rebase` | Rebase the extra fields and any EEA help text into Volto 18 sidebar. | Paired with edit/view/schema shadows |
| `volto/components/manage/Blocks/LeadImage/View.jsx` | EEA lead-image rendering and link/image behavior. | Very small upstream delta. | `needs rebase` | Keep the rendering logic, but sync to Volto 18 imports and link component changes. | Paired with edit/sidebar shadows |
| `volto/components/manage/Blocks/LeadImage/schema.js` | Historical lead-image schema customization. | No standalone schema file in Volto 18. | `moved/renamed` | Fold any still-needed schema fields into Volto 18 `LeadImageSidebar.jsx`; remove this path shadow. | Related to removed AlignChooser path |

### Manage UI: editorial tooling

| Shadow | Why customized in 17 | Volto 18 delta | Status | Next action | Support |
| --- | --- | --- | --- | --- | --- |
| `volto/components/manage/Controlpanels/Groups/RenderGroups.jsx` | Adjusts role rendering, especially authenticated-role behavior in group control panel. | Large upstream delta. | `needs rebase` | Reapply only the role-selection behavior on top of Volto 18 component. | `.diff`, test, snapshot |
| `volto/components/manage/Diff/DiffField.jsx` | Better history diff rendering for complex values and embedded views. | Small upstream delta, but the customization is large. | `needs rebase` | Rebase carefully; this shadow is brittle because it spins isolated stores/router instances. | `.diff`, `.txt` |
| `volto/components/manage/Display/Display.jsx` | Restricts who can change layout based on configured roles. | Large upstream delta. | `needs rebase` | Re-implement the role gate against Volto 18 rather than carrying the class component. | `Readme.md` |
| `volto/components/manage/History/History.jsx` | Adds copied-to/copied-from history links and fixes invalid URL handling. | Moderate upstream delta. | `needs rebase` | Rebase the history-link logic on top of Volto 18, keeping the recent `#297683` URL guards. | `.diff`, changelog refs `#289335`, `#297683` |
| `volto/components/manage/Sidebar/ObjectBrowserBody.jsx` | Uses rights as default alt text and supports image preview. | Large upstream delta. | `needs rebase` | Reapply alt-default and preview behavior to the Volto 18 object browser body. | Sidebar `README.md`, inline comment |
| `volto/components/manage/Sidebar/ObjectBrowserNav.jsx` | Enables previewing images from file picker navigation. | Large upstream delta. | `needs rebase` | Rebase image-preview navigation behavior only. | Sidebar `README.md` |
| `volto/components/manage/Sidebar/SidebarPopup.jsx` | Backport from Volto PR `#5520`. | Moderate upstream delta; likely partly upstreamed already. | `needs rebase` | Diff against the original PR and keep only the remaining non-upstreamed behavior. | Sidebar `README.md` |
| `volto/components/manage/Sidebar/SidebarPopup copy.jsx` | Backup copy, not a real customization target. | No Volto 18 counterpart. | `candidate removal` | Delete as dead support material once the audit is converted into code changes. | None |
| `volto/components/manage/Toolbar/More.jsx` | EEA editorial actions in More menu, including `historyview`, local roles, and custom routing. | Very large upstream delta. | `needs rebase` | Re-implement menu item injections against Volto 18 menu composition, not by keeping the old full shadow. | None |
| `volto/components/manage/UniversalLink/UniversalLink.jsx` | Removes `noreferrer` from external links. | Volto 18 counterpart moved to `UniversalLink.tsx`. | `moved/renamed` | Reassess whether the SEO requirement still justifies overriding the new typed component; if yes, patch the TSX implementation minimally. | Inline comment in shadow |
| `volto/components/manage/Widgets/NumberWidget.jsx` | Normalizes string input to numeric value. | Tiny upstream delta. | `compatible` | Keep and verify form serialization. | Test, widgets `README.md` |
| `volto/components/manage/Widgets/ObjectBrowserWidget.jsx` | Preserves hash anchors in pasted internal URLs. | Moderate upstream delta. | `needs rebase` | Rebase only the anchor-preservation logic. | Widgets `README.md` |
| `volto/components/manage/Workflow/Workflow.jsx` | Old workflow UI fork kept for EEA editorial flow/history behavior. | Small upstream delta, but the shadow is based on older Volto 16 code. | `needs rebase` | Rebuild the desired workflow behavior on current Volto 18 code; do not keep the old 16-era copy. | `README.txt`, test |

### Theme UI

| Shadow | Why customized in 17 | Volto 18 delta | Status | Next action | Support |
| --- | --- | --- | --- | --- | --- |
| `volto/components/theme/Breadcrumbs/Breadcrumbs.jsx` | EEA breadcrumb markup/behavior paired with custom reducer state. | Moderate upstream delta. | `needs rebase` | Rebase with the reducer shadow as one unit. | Test, snapshot |
| `volto/components/theme/Comments/Comments.jsx` | EEA comments presentation; historically resynced with Volto updates. | Moderate upstream delta. | `needs rebase` | Rebase to Volto 18 and keep the custom markup/styles only. | Test, snapshot, `comments.less` |
| `volto/components/theme/Comments/comments.less` | EEA comments styles. | No Volto source file to compare. | `compatible` | Keep; validate selectors after rebase of `Comments.jsx`. | Test and snapshot depend on it |
| `volto/components/theme/ContactForm/ContactForm.jsx` | Redirects to `config.settings.contactForm`. | Moderate upstream delta. | `needs rebase` | Keep the redirect behavior on top of Volto 18 component or replace with a lighter wrapper if possible. | Test, snapshot |
| `volto/components/theme/ContentMetadataTags/ContentMetadataTags.jsx` | EEA metadata tag presentation. | Small upstream delta. | `compatible` | Keep, then verify metadata rendering on representative content types. | `README.md` |
| `volto/components/theme/Error/ErrorBoundary.jsx` | Custom error boundary. | No upstream delta. | `compatible` | Keep. | None |
| `volto/components/theme/EventDetails/EventDetails.jsx` | Event detail tweaks. | Small upstream delta. | `compatible` | Keep, then sanity-check event metadata rendering. | None |
| `volto/components/theme/Footer/Footer.jsx` | Backend-driven footer links, social/contact actions, and EEA footer behavior. | Small upstream delta. | `compatible` | Keep, but smoke-test data coming from backend settings. | Changelog refs `#151856`, `#253198` |
| `volto/components/theme/Header/Header.jsx` | Full EEA header fork with custom navigation settings, subsite integration, and language switcher. | Small upstream delta in core, but the shadow is large. | `needs rebase` | Review against Volto 18 line-by-line and keep only the EEA-specific navigation/header behavior. | Test, snapshot, paired `LanguageSwitcher.jsx` |
| `volto/components/theme/Header/LanguageSwitcher.jsx` | Shows/hides language choices based on supported languages and uses EEA routing behavior. | No direct Volto counterpart; local helper for the header fork. | `compatible` | Keep with the header shadow. | Header tests indirectly cover it |
| `volto/components/theme/Image/Image.jsx` | Custom image scale selection and support for `preview_image_link` / `base_path`. | Small upstream delta. | `compatible` | Keep, then verify scale and linked-image behavior. | `README.md` |
| `volto/components/theme/OutdatedBrowser/OutdatedBrowser.jsx` | EEA-specific outdated-browser treatment. | No upstream delta. | `compatible` | Keep. | None |
| `volto/components/theme/PasswordReset/RequestPasswordReset.jsx` | Redirects users to the Eionet password reset flow. | Small upstream delta. | `compatible` | Keep. | None |
| `volto/components/theme/Tags/Tags.jsx` | EEA tag link behavior replacing older widget-view customizations. | Moderate upstream delta. | `compatible` | Keep, but confirm links still resolve after the Volto 18 router update. | Changelog notes about moving away from older tag customizations |
| `volto/components/theme/Unauthorized/Unauthorized.jsx` | Custom login redirect with return URL and explicit back behavior. | Small upstream delta. | `compatible` | Keep and verify redirect loop behavior. | None |
| `volto/components/theme/View/DefaultView.jsx` | EEA default page view with context navigation integration and custom layout. | Small upstream delta in core, but shadow is large. | `needs rebase` | Rebase carefully with the header/breadcrumb/image stack in mind. | Paired `style.less` |
| `volto/components/theme/View/EventDatesInfo.jsx` | Event date wording/permalink tweaks. | Tiny upstream delta. | `compatible` | Keep. | Inline comments only |
| `volto/components/theme/View/EventView.jsx` | EEA event page view with permalink and layout changes. | Small upstream delta. | `needs rebase` | Rebase on Volto 18 `EventView.jsx`, keeping only custom event-page composition. | Paired with `EventDatesInfo.jsx` and `style.less` |
| `volto/components/theme/View/style.less` | EEA page-view styling supporting `DefaultView` and `EventView`. | No Volto source file to compare. | `compatible` | Keep and validate selectors after view rebase. | Indirectly covered by view shadows |

## Support Artifacts Reviewed

- `volto/actions/vocabularies/`: `vocabularies.js.md`, both `.diff` files, and the shadowed test confirm this is a backport, not an accidental fork.
- `volto/components/manage/Blocks/Grid/readme.md`: explains the legacy grid compatibility requirement.
- `volto/components/manage/Sidebar/README.md`: documents `SidebarPopup` PR `#5520` and file-picker image preview behavior.
- `volto/components/manage/Widgets/README.md`: documents the exact reasons for `ObjectBrowserWidget` and `NumberWidget`.
- `volto/components/manage/Workflow/README.txt`: confirms the workflow shadow started as a Volto 16 copy, which raises risk.
- `volto/components/manage/Controlpanels/Groups/RenderGroups.diff`, `.../Diff/DiffField.diff`, and `.../History/History.diff`: useful to reconstruct original intent during the rebase phase.
- `volto/helpers/Html/Readme.md`: confirms the helper exists specifically for CSP support.
- Tests/snapshots exist for `Image/Edit`, `LeadImage/AlignChooser`, `RenderGroups`, `NumberWidget`, `Workflow`, `Breadcrumbs`, `Comments`, `ContactForm`, and `Header`.
- `SidebarPopup copy.jsx` appears to be leftover support material rather than an active customization.

## Recommended Next Pass

1. Remove clear dead weight first:
   `@plone/volto-slate/elementEditor/utils.js` and `SidebarPopup copy.jsx`.
2. Rebase the SSR/CSP layer together:
   `volto/server.jsx` and `volto/helpers/Html/Html.jsx`.
3. Rework image and lead-image against Volto 18 structure:
   use Volto 18 `ImageSidebar.jsx`, `schema.jsx`, and current lead-image sidebar instead of preserving old file paths.
4. Rebase editorial shell components next:
   sidebar/object browser, toolbar more menu, display, history, workflow, and diff field.
5. Rebase the public EEA theme stack last:
   header, breadcrumbs, default/event views, footer, tags, and comments.
