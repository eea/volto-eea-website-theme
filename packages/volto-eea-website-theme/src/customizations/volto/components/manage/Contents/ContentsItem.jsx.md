# ContentsItem.jsx customization

This customization shadows Volto core's
`src/components/manage/Contents/ContentsItem.jsx` from `@plone/volto` 18.33.1.

The functional changes are limited to the contents table item link:

- The expired and scheduled date checks are computed once per render as
  `isExpired` and `isScheduled`, then reused by the badge rendering.
- The title wrapper and title text are allowed to shrink with flexbox
  (`flex: '1 1 auto'` and `minWidth: 0`), while the status badges keep their
  intrinsic width with `flexShrink: 0`.

The goal is to avoid title text colliding with the `Expired` or `Scheduled`
badges without hardcoding a pixel width for the title.

When upgrading Volto, compare the new core component with this override and
refresh `ContentsItem.jsx.diff` if upstream changed around the contents item
title or badge rendering.
