import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { Icon, Button, Grid } from 'semantic-ui-react';
import config from '@plone/volto/registry';

const socialPlatforms = {
  facebook: {
    shareLink: (url) => `https://facebook.com/sharer.php?u=${url}`,
  },
  twitter: {
    shareLink: (url) => `https://www.twitter.com/share?url=${url}`,
  },
  linkedin: {
    shareLink: (url) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  },
  reddit: {
    shareLink: (url, title) => `https://reddit.com/submit?url=${url}`,
  },
};

export const getImageSource = (image) => {
  if (image?.download) return image.download;
  if (image?.encoding)
    return `data:${image['content-type']};${image['encoding']},${image['data']}`;
  return null;
};

export const sharePage = (url, platform) => {
  if (!socialPlatforms[platform]) return;
  const link = document.createElement('a');
  link.setAttribute('href', socialPlatforms[platform].shareLink(url));
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noreferrer');
  link.click();
};

const Banner = ({ children }) => {
  return <div className="eea banner">{children}</div>;
};

Banner.Action = ({ title, icon, color, onClick, className }) => {
  return (
    <div className="action">
      <Button className={className} basic inverted onClick={onClick}>
        <Icon className={icon} color={color}></Icon>
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

Banner.Title = ({ children }) => (
  <h1 className="documentFirstHeading">{children}</h1>
);
Banner.Metadata = ({ children }) => <p className="metadata">{children}</p>;
Banner.MetadataField = ({ hidden, type = 'text', label, value, title }) => {
  moment.locale(config.settings.dateLocale || 'en-gb');
  if (hidden || !value) return '';
  if (type === 'date' && value)
    return (
      <span
        className={`field ${type}`}
        title={title.replace('{}', value.format('lll'))}
      >
        {label} {value.format('ll')}
      </span>
    );
  return <span className={`field ${type}`}>{value}</span>;
};

export default compose(
  connect((state) => ({
    content: state.content.data,
  })),
)(Banner);
