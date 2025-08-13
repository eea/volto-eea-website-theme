import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { withRouter } from 'react-router';
import { compose } from 'redux';
import { Accordion, Icon } from 'semantic-ui-react';

import Slugger from 'github-slugger';

import { UniversalLink } from '@plone/volto/components';
import { withContentNavigation } from '@plone/volto/components/theme/Navigation/withContentNavigation';
import withEEASideMenu from '@eeacms/volto-block-toc/hocs/withEEASideMenu';
import { flattenToAppURL } from '@plone/volto/helpers';

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
  hasWideContent = false,
}) => {
  const { items = [], title, has_custom_name } = navigation;
  const intl = useIntl();
  const navOpen =
    ['mobile', 'tablet'].includes(device) || hasWideContent ? false : true;
  const [isNavOpen, setIsNavOpen] = React.useState(navOpen);
  const [activeItems, setActiveItems] = React.useState({});
  const contextNavigationListRef = React.useRef(null);
  const summaryRef = React.useRef(null);

  const onClickSummary = React.useCallback((e) => {
    e.preventDefault();
    setIsNavOpen((prev) => !prev);
  }, []);

  React.useEffect(() => {
    if (isMenuOpenOnOutsideClick === false) setIsNavOpen(false);
  }, [isMenuOpenOnOutsideClick]);

  React.useEffect(() => {
    if (!navOpen) {
      const handleOutsideClick = (event) => {
        if (
          summaryRef.current &&
          contextNavigationListRef.current &&
          !summaryRef.current.contains(event.target) &&
          !contextNavigationListRef.current.contains(event.target)
        ) {
          setIsNavOpen(false);
        }
      };

      document.addEventListener('click', handleOutsideClick);
      return () => {
        document.removeEventListener('click', handleOutsideClick);
      };
    }
  }, [summaryRef, navOpen]);

  const onKeyDownSummary = React.useCallback(
    (e) => {
      if (e.keyCode === 13 || e.keyCode === 32) {
        e.preventDefault();
        onClickSummary(e);
      }
    },
    [onClickSummary],
  );

  const renderItems = ({ item, level = 0, index }) => {
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
    const firstItem = index === 0;

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
              <Icon
                className={
                  isActive ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
                }
              />
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
              navigation_home: firstItem,
            })}
          >
            {firstItem && <Icon className={'ri-home-5-line'} />}
            {title}
          </UniversalLink>
        )}
      </li>
    );
  };

  return items.length ? (
    <>
      <nav className="context-navigation" aria-label={title}>
        <details open={isNavOpen}>
          {/* eslint-disable-next-line */}
          <summary
            className="context-navigation-header accordion-header"
            onClick={onClickSummary}
            onKeyDown={onKeyDownSummary}
            ref={summaryRef}
          >
            {has_custom_name ? title : intl.formatMessage(messages.navigation)}
            <Icon
              className={
                isNavOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
              }
            />
          </summary>
          <ul
            className="context-navigation-list accordion-list"
            ref={contextNavigationListRef}
          >
            {items.map((item, index) =>
              renderItems({ item, level: 0, index: index }),
            )}
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
  (WrappedComponent) => (props) =>
    withEEASideMenu(WrappedComponent)({
      ...props,
      targetParent: '.eea.header ',
      fixedVisibilitySwitchTarget: '.main.bar',
      insertBeforeOnMobile: '.banner',
      hasWideContent: props.hasWideContent,
      shouldRender: props.navigation?.items?.length > 0,
    }),
)(AccordionNavigation);
