import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Icon, Button, Grid } from 'semantic-ui-react';

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
        <Icon name={icon} color={color}></Icon>
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

Banner.Title = ({ children }) => <span className="title">{children}</span>;
Banner.Metadata = ({ children }) => <p className="metadata">{children}</p>;
Banner.MetadataField = ({
  hidden,
  type = 'text',
  value,
  title,
  format = 'DD MMM YYYY',
}) => {
  if (hidden || !value) return '';
  if (type === 'date' && value)
    return (
      <span
        className="field"
        title={title.replace('{}', value.format('Do MMMM YYYY, h:mm:ss a'))}
      >
        {value.format(format)}
      </span>
    );
  return <span className="field">{value}</span>;
};

export default compose(
  connect((state) => ({
    content: state.content.data,
  })),
)(Banner);
