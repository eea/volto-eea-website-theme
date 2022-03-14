import React, { useMemo } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Container, Icon, Button, Grid } from 'semantic-ui-react';
import { Image } from 'semantic-ui-react';
import { flattenToAppURL } from '@plone/volto/helpers';
import { Toast } from '@plone/volto/components';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';

const notifyUser = (content, toast) => {
  return toast.info(<Toast info title="Bookmark page" content={content} />, {
    autoClose: 5000,
  });
};

const addBookmark = (url, title, toast) => {
  if (!url && window) {
    url = window.location;
  }
  if (!title && document) {
    title = document.title;
  }
  let browser = navigator.userAgent.toLowerCase();
  if (window.sidebar && window.sidebar.addPanel) {
    // Mozilla, Firefox, Netscape
    window.sidebar.addPanel(title, url, '');
  } else if (window.external) {
    // IE or chrome
    if (browser.indexOf('chrome') === -1 && window.external.AddFavorite) {
      // ie
      window.external.AddFavorite(url, title);
    } else {
      // chrome
      notifyUser(
        'Please Press CTRL+D (or Command+D for macs) to bookmark this page',
        toast,
      );
    }
  } else if (window.opera && window.print) {
    // Opera - automatically adds to sidebar if rel=sidebar in the tag
    return true;
  } else if (browser.indexOf('konqueror') !== -1) {
    // Konqueror
    notifyUser('Please press CTRL+B to bookmark this page.', toast);
  } else if (browser.indexOf('webkit') !== -1) {
    // safari
    notifyUser(
      'Please press CTRL+B (or Command+D for macs) to bookmark this page.',
      toast,
    );
  } else {
    notifyUser(
      'Your browser cannot add bookmarks using this link. Please add this link manually.',
      toast,
    );
  }
};

const Banner = ({ content, moment, toastify }) => {
  const image = content.image;
  const publishingDate = useMemo(
    () => (content['effective'] ? moment.default(content['effective']) : null),
    [content, moment],
  );
  const modificationDate = useMemo(
    () => (content['modified'] ? moment.default(content['modified']) : null),
    [content, moment],
  );

  return (
    <div className="eea banner">
      <div
        className="image"
        style={image ? { backgroundImage: `url(${image.download})` } : {}}
      ></div>
      <div className="gradient">
        <Container>
          <Banner.Content
            actions={
              <>
                <Banner.Action
                  icon="bookmark outline"
                  title="Bookmark"
                  className="bookmark"
                  onClick={() => {
                    addBookmark(
                      content['@id'],
                      content['title'],
                      toastify.toast,
                    );
                  }}
                />
                <Banner.Action
                  icon="download"
                  title="Download"
                  className="download"
                  onClick={() => {
                    window.print();
                  }}
                />
              </>
            }
          >
            <Banner.Title>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Banner.Title>
            <Banner.Metadata>
              <span>{content['@type']} | </span>
              {publishingDate && (
                <span
                  title={`Published on ${publishingDate.format(
                    'dddd, MMMM Do YYYY, h:mm:ss a',
                  )}`}
                >
                  {publishingDate.format('ddd hA')} |{' '}
                </span>
              )}
              {modificationDate && (
                <span
                  title={`Modified on ${modificationDate.format(
                    'dddd, MMMM Do YYYY, h:mm:ss a',
                  )}`}
                >
                  {modificationDate.format('ddd hA')} |{' '}
                </span>
              )}
              <span>5 min read</span>
            </Banner.Metadata>
          </Banner.Content>
        </Container>
      </div>
    </div>
  );
};

Banner.Action = function ({ id, title, icon, onClick, className }) {
  return (
    <div className="action">
      <Button className={className} basic inverted onClick={onClick}>
        <Icon name={icon}></Icon>
        <span className="mobile hidden">{title}</span>
      </Button>
    </div>
  );
};

Banner.Content = ({ children, actions }) => {
  return (
    <div className="content">
      <Grid>
        <Grid.Column mobile={10} tablet={9} computer={9}>
          {children}
        </Grid.Column>
        <Grid.Column mobile={2} tablet={3} computer={3} className="actions">
          {actions}
        </Grid.Column>
      </Grid>
    </div>
  );
};

Banner.Title = ({ children }) => <p className="title">{children}</p>;
Banner.Metadata = ({ children }) => <p className="metadata">{children}</p>;

export default compose(
  injectLazyLibs(['toastify', 'moment']),
  connect((state) => ({
    content: state.content.data,
  })),
)(Banner);
