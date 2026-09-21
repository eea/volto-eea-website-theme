import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { getBaseUrl } from '@plone/volto/helpers/Url/Url';
import AccordionContextNavigation from '@eeacms/volto-eea-website-theme/components/manage/Blocks/ContextNavigation/variations/Accordion';

/**
 * Recursively check whether the content already contains a contextNavigation
 * accordion block that would render its own side menu.
 */
const hasContextNavigationAccordion = (node) => {
  if (!node) return false;
  if (
    node['@type'] === 'contextNavigation' &&
    node['variation'] === 'accordion'
  ) {
    return true;
  }
  if (node.blocks && node.blocks_layout?.items) {
    return node.blocks_layout.items.some((id) =>
      hasContextNavigationAccordion(node.blocks[id]),
    );
  }
  if (node.data?.blocks && node.data?.blocks_layout?.items) {
    return node.data.blocks_layout.items.some((id) =>
      hasContextNavigationAccordion(node.data.blocks[id]),
    );
  }
  return false;
};

/**
 * Render the auto-injected accordion side menu for matching
 * context_navigation actions.
 *
 * Use this in content-type views (DefaultView, NewsItemView, ...)
 * where the page might be under a subtree configured via
 * portal_actions/context_navigation.
 */
const ContextNavigationInjector = ({ content, location }) => {
  const hasExistingSideMenu = React.useMemo(
    () => hasContextNavigationAccordion(content),
    [content],
  );

  const { contextNavigationActions } = useSelector(
    (state) => ({
      contextNavigationActions: state.actions?.actions?.context_navigation,
    }),
    shallowEqual,
  );

  const path = getBaseUrl(location?.pathname || '');
  const content_type = content?.['@type'];

  const matchingNavigationPath = React.useMemo(() => {
    const navigation_paths = contextNavigationActions || [];
    if (!navigation_paths?.length) return null;

    const normalize = (p) => (p?.endsWith('/') ? p : `${p}/`);
    const basePath = normalize(path);

    const candidates = navigation_paths.filter((np) =>
      basePath.startsWith(normalize(np.url)),
    );
    if (!candidates.length) return null;

    const candidate = candidates.reduce(
      (best, np) => (!best || np.url.length > best.url.length ? np : best),
      null,
    );
    const disabledTypes =
      (candidate && candidate.disableContextNavigationFor) || [];
    if (disabledTypes.includes(content_type)) return null;
    return candidate;
  }, [contextNavigationActions, content_type, path]);

  if (!matchingNavigationPath || hasExistingSideMenu) return null;

  return (
    <AccordionContextNavigation
      insertBefore={matchingNavigationPath.insertBefore}
      params={{
        name: matchingNavigationPath.title,
        no_thumbs: matchingNavigationPath.no_thumbs ?? true,
        no_icons: matchingNavigationPath.no_icons ?? true,
        root_path: matchingNavigationPath.url,
        includeTop: matchingNavigationPath.includeTop ?? true,
        bottomLevel: matchingNavigationPath.bottomLevel ?? 4,
        topLevel: matchingNavigationPath.topLevel ?? 0,
        currentFolderOnly: matchingNavigationPath.currentFolderOnly ?? false,
        ...(matchingNavigationPath.portal_type && {
          portal_type: matchingNavigationPath.portal_type,
        }),
      }}
    />
  );
};

export default ContextNavigationInjector;
