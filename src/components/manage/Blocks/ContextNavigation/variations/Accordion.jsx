import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { withRouter } from 'react-router';
import { compose } from 'redux';
import { Accordion } from 'semantic-ui-react';

import Slugger from 'github-slugger';

import { Icon, UniversalLink } from '@plone/volto/components';
import { withContentNavigation } from '@plone/volto/components/theme/Navigation/withContentNavigation';
import withEEASideMenu from '@eeacms/volto-block-toc/hocs/withEEASideMenu';
import { flattenToAppURL } from '@plone/volto/helpers';

import downIcon from '@plone/volto/icons/down-key.svg';
import upIcon from '@plone/volto/icons/up-key.svg';

const messages = defineMessages({
  navigation: {
    id: 'Navigation',
    defaultMessage: 'Navigation',
  },
});

const AccordionNavigation = ({
  navigation = {},
  device,
  isMenuOpenOnOutsideClick,
}) => {
  const { items = [], title, has_custom_name } = navigation;
  const intl = useIntl();
  const navOpen = ['mobile', 'tablet'].includes(device) ? false : true;
  const [isNavOpen, setIsNavOpen] = React.useState(navOpen);
  const [activeItems, setActiveItems] = React.useState({});

  const onClickSummary = React.useCallback((e) => {
    e.preventDefault();
    setIsNavOpen((prev) => !prev);
  }, []);

  React.useEffect(() => {
    if (isMenuOpenOnOutsideClick === false) setIsNavOpen(false);
  }, [isMenuOpenOnOutsideClick]);

  const onKeyDownSummary = React.useCallback(
    (e) => {
      if (e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
        onClickSummary(e);
      }
    },
    [onClickSummary],
  );

  const renderItems = ({ item, level = 0 }) => {
    const {
      title,
      href,
      is_current,
      is_in_path,
      items: childItems,
      type,
    } = item;
    const hasChildItems = childItems && childItems.length > 0;
    const normalizedTitle = Slugger.slug(title);

    const checkIfActive = () => {
      return activeItems[href] !== undefined ? activeItems[href] : is_in_path;
    };

    const isActive = checkIfActive();

    const handleTitleClick = () => {
      setActiveItems((prev) => ({ ...prev, [href]: !isActive }));
    };

    return (
      <li
        className={cx({
          is_in_path,
          'accordion-list-title': !hasChildItems,
          'accordion-list-item': hasChildItems,
        })}
        key={href}
      >
        {hasChildItems ? (
          <Accordion className="default">
            <Accordion.Title
              active={isActive}
              as={'button'}
              aria-expanded={isActive}
              onClick={handleTitleClick}
              aria-controls={`accordion-content-${normalizedTitle}`}
              id={`accordion-title-${normalizedTitle}`}
            >
              <span className="title-text">{title}</span>
              <Icon name={isActive ? upIcon : downIcon} size="32px" />
            </Accordion.Title>
            <Accordion.Content
              active={isActive}
              id={`accordion-content-${normalizedTitle}`}
              aria-labelledby={`accordion-title-${normalizedTitle}`}
              role="region"
            >
              <ul className="accordion-list">
                {childItems.map((child) =>
                  renderItems({ item: child, level: level + 1 }),
                )}
              </ul>
            </Accordion.Content>
          </Accordion>
        ) : (
          <UniversalLink
            href={flattenToAppURL(href)}
            className={cx(`title-link contenttype-${type}`, {
              current: is_current,
              in_path: is_in_path,
            })}
          >
            {title}
          </UniversalLink>
        )}
      </li>
    );
  };

  return items.length ? (
    <>
      <nav className="context-navigation">
        <details open={isNavOpen}>
          {/* eslint-disable-next-line */}
          <summary
            className="context-navigation-header accordion-header"
            onClick={onClickSummary}
            onKeyDown={onKeyDownSummary}
          >
            {has_custom_name ? title : intl.formatMessage(messages.navigation)}
            <Icon name={isNavOpen ? upIcon : downIcon} size="40px" />
          </summary>
          <ul className="context-navigation-list accordion-list">
            {items.map((item) => renderItems({ item }))}
          </ul>
        </details>
      </nav>
    </>
  ) : null;
};

AccordionNavigation.propTypes = {
  /**
   * Navigation tree returned from @contextnavigation restapi endpoint
   */
  navigation: PropTypes.shape({
    items: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        url: PropTypes.string,
        href: PropTypes.string,
        is_current: PropTypes.bool,
        is_in_path: PropTypes.bool,
        items: PropTypes.array,
        type: PropTypes.string,
      }),
    ),
    has_custom_name: PropTypes.bool,
    title: PropTypes.string,
  }),
};

export default compose(
  withRouter,
  withContentNavigation,
  withEEASideMenu,
)(AccordionNavigation);
