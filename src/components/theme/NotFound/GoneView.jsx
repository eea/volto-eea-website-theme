import { useEffect, useState } from 'react';
import { compose } from 'redux';
import { injectIntl } from 'react-intl';
import { withRootNavigation } from '@eeacms/volto-eea-website-theme/hocs';
import { BodyClass, toBackendLang } from '@plone/volto/helpers';
import { FormattedMessage } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import { Container, Accordion } from 'semantic-ui-react';
import { withServerErrorCode } from '@plone/volto/helpers/Utils/Utils';
import { useDispatch, useSelector } from 'react-redux';
import { getNavigation } from '@plone/volto/actions';
import config from '@plone/volto/registry';

/**
 * Gone view function.
 * @function GoneView
 * @returns {string} Markup of the gone page.
 */
const GoneView = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [archiveUrl, setArchiveUrl] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleAccordionClick = (e, titleProps) => {
    const { index } = titleProps;
    const newIndex = activeIndex === index ? -1 : index;
    setActiveIndex(newIndex);
  };

  useEffect(() => {
    setArchiveUrl(`https://web.archive.org/*/${window.location.href}`);
  }, [location]);

  const lang = useSelector((state) => state.intl.locale);

  useEffect(() => {
    dispatch(
      getNavigation(
        config.settings.isMultilingual ? `/${toBackendLang(lang)}` : '/',
        config.settings.navDepth,
      ),
    );
  }, [dispatch, lang]);

  return (
    <Container className="view-wrapper">
      <BodyClass className="page-not-found" />
      <h1>
        <FormattedMessage
          id="This page has been retired"
          defaultMessage="This page has been retired"
        />
      </h1>
      <p className="description">
        <FormattedMessage
          id="This content was part of our previous website and is no longer available. We've recently upgraded our platform and restructured our content to serve you better."
          defaultMessage="This content was part of our previous website and is no longer available. We've recently upgraded our platform and restructured our content to serve you better."
        />
      </p>
      <h2>
        <FormattedMessage
          id="What you can do?"
          defaultMessage="What you can do?"
        />
      </h2>
      <div className="accordion-block">
        <Accordion className="secondary">
          <Accordion.Title
            active={activeIndex === 0}
            index={0}
            onClick={handleAccordionClick}
            tabIndex={0}
            role="button"
            aria-expanded={activeIndex === 0}
            onKeyDown={(e) => {
              if (e.keyCode === 13 || e.keyCode === 32) {
                handleAccordionClick(e, { index: 0 });
              }
            }}
          >
            <span>
              <FormattedMessage
                id="View archived version"
                defaultMessage="View archived version"
              />
            </span>
            <i
              className={
                activeIndex === 0
                  ? 'ri-arrow-up-s-line'
                  : 'ri-arrow-down-s-line'
              }
            />
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 0}>
            <p>
              <FormattedMessage
                id="You may be able to find an archived copy of this page on the {archive_url}"
                defaultMessage="You may be able to find an archived copy of this page on the {archive_url}"
                values={{
                  archive_url: (
                    <a
                      href={archiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FormattedMessage
                        id="Wayback Machine"
                        defaultMessage="Wayback Machine"
                      />
                    </a>
                  ),
                }}
              />
            </p>
          </Accordion.Content>
        </Accordion>

        <Accordion className="secondary">
          <Accordion.Title
            active={activeIndex === 2}
            index={2}
            onClick={handleAccordionClick}
            tabIndex={0}
            role="button"
            aria-expanded={activeIndex === 2}
            onKeyDown={(e) => {
              if (e.keyCode === 13 || e.keyCode === 32) {
                handleAccordionClick(e, { index: 2 });
              }
            }}
          >
            <span>
              <FormattedMessage
                id="Looking for something specific?"
                defaultMessage="Looking for something specific?"
              />
            </span>
            <i
              className={
                activeIndex === 2
                  ? 'ri-arrow-up-s-line'
                  : 'ri-arrow-down-s-line'
              }
            />
          </Accordion.Title>
          <Accordion.Content active={activeIndex === 2}>
            <p>
              <FormattedMessage
                id="Try our {search} or visit our {homepage} to find what you need on our updated site."
                defaultMessage="Try our {search} or visit our {homepage} to find what you need on our updated site."
                values={{
                  search: (
                    <Link to="/en/advanced-search">
                      <FormattedMessage id="search" defaultMessage="search" />
                    </Link>
                  ),
                  homepage: (
                    <Link to="/en">
                      <FormattedMessage
                        id="homepage"
                        defaultMessage="homepage"
                      />
                    </Link>
                  ),
                }}
              />
            </p>
          </Accordion.Content>
        </Accordion>
      </div>
    </Container>
  );
};

export default compose(
  withServerErrorCode(410),
  injectIntl,
  withRootNavigation,
)(GoneView);
