import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Icon, Button, Grid } from 'semantic-ui-react';
import { Toast } from '@plone/volto/components';

export const notifyUser = (content, toast) => {
  return toast.info(<Toast info title="Bookmark page" content={content} />, {
    autoClose: 5000,
  });
};

export const addBookmark = (url, title, toast) => {
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

const Banner = ({ content, children }) => {
  const image = content.image;
  return (
    <div className="eea banner">
      <div
        className="image"
        style={image ? { backgroundImage: `url(${image.download})` } : {}}
      ></div>
      <div className="gradient">{children}</div>
    </div>
  );
};

Banner.Action = function ({ title, icon, onClick, className }) {
  return (
    <div className="action">
      <Button className={className} basic inverted onClick={onClick}>
        <Icon name={icon}></Icon>
        <span className="mobile hidden">{title}</span>
      </Button>
    </div>
  );
};

Banner.Content = ({ children, actions, style }) => {
  return (
    <div className="content" style={style}>
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
  connect((state) => ({
    content: state.content.data,
  })),
)(Banner);
