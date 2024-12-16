import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { compose } from 'redux';
import { withRouter } from 'react-router';

import { flattenToAppURL } from '@plone/volto/helpers';
import { UniversalLink, MaybeWrap, Icon } from '@plone/volto/components';
import { withContentNavigation } from '@plone/volto/components/theme/Navigation/withContentNavigation';

import downloadSVG from '@plone/volto/icons/download.svg';

/**
 * Handles click on summary links and closes parent details elements
 * @param {Event} e - Click event
 * @param {boolean} wrapWithDetails - Whether the element is wrapped in details
 */
function handleSummaryClick(e, wrapWithDetails) {
  if (wrapWithDetails) {
    e.preventDefault();

    const currentDetails = e.target.closest('details');
    // toggle the current details
    if (currentDetails) {
      currentDetails.open = !currentDetails.open;
    }
  }
}

/**
 * Renders a navigation node as a list item with proper styling and links
 * @param {Object} node - Navigation node object containing title, href, type etc
 * @param {number} parentLevel - Parent level in navigation hierarchy
 * @returns {React.Component} UL component with navigation node content
 */
function renderNode(node, parentLevel) {
  const level = parentLevel + 1;
  const hasChildItems = node.items?.length;
  const nodeType = node.type;
  const isDocument = nodeType === 'document';
  const isFile = nodeType === 'file';
  let wrapWithDetails = isDocument && level > 2 && hasChildItems;
  return (
    <li
      key={node['@id']}
      className={`list-item level-${level} ${node.is_current ? 'active' : ''}`}
    >
      <MaybeWrap
        condition={wrapWithDetails}
        as="details"
        className="context-navigation-detail"
      >
        <MaybeWrap
          condition={wrapWithDetails}
          as="summary"
          className="context-navigation-summary"
        >
          <UniversalLink
            href={flattenToAppURL(node.href)}
            download={isFile}
            tabIndex={wrapWithDetails ? '-1' : 0}
            title={node.description}
            className={cx(`list-link contenttype-${nodeType}`, {
              in_path: node.is_in_path,
            })}
            onClick={(e) =>
              wrapWithDetails && handleSummaryClick(e, wrapWithDetails)
            }
          >
            {isFile && <Icon name={downloadSVG} size="16px" />}
            {node.title}
            {isFile && node.getObjSize ? ' [' + node.getObjSize + ']' : ''}
          </UniversalLink>
        </MaybeWrap>
        {(hasChildItems && (
          <ul className="list">
            {node.items.map((node) => renderNode(node, level))}
          </ul>
        )) ||
          ''}
      </MaybeWrap>
    </li>
  );
}
/**
 * A navigation slot implementation, similar to the classic Plone navigation
 * portlet. It uses the same API, so the options are similar to
 * INavigationPortlet
 */
export function ReportNavigation(props) {
  const { navigation = {} } = props;
  const { items = [] } = navigation;

  return items.length ? (
    <nav className="context-navigation report-navigation">
      {navigation.title ? (
        <div className="context-navigation-header">
          <UniversalLink href={flattenToAppURL(navigation.url || '')}>
            {navigation.title}
          </UniversalLink>
        </div>
      ) : (
        ''
      )}
      <ul className="list">{items.map((node) => renderNode(node, 0))}</ul>
    </nav>
  ) : (
    ''
  );
}

ReportNavigation.propTypes = {
  /**
   * Navigation tree returned from @contextnavigation restapi endpoint
   */
  navigation: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        url: PropTypes.string,
      }),
    ),
    has_custom_name: PropTypes.bool,
    title: PropTypes.string,
  }),
};

export default compose(withRouter, withContentNavigation)(ReportNavigation);
