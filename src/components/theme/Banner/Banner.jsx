import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Icon, Button, Grid, Modal, Segment } from 'semantic-ui-react';

export const getImageSource = (image) => {
  if (image?.download) return image.download;
  if (image?.encoding)
    return `data:${image['content-type']};${image['encoding']},${image['data']}`;
  return null;
};

const Banner = ({ children }) => {
  return <div className="eea banner">{children}</div>;
};

Banner.Action = ({ title, icon, onClick, className }) => {
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

Banner.Title = ({ children }) => <span className="title">{children}</span>;
Banner.Metadata = ({ children }) => <p className="metadata">{children}</p>;
Banner.MetadataField = ({
  hidden,
  type = 'text',
  value,
  title,
  format = 'DD MMM YYYY',
}) => {
  if (hidden) return '';
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

export const ShareModal = ({ open, setOpen, url, title, text }) => {
  const [coping, setCoping] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (open && copied) {
      setCopied(false);
    }
    /* eslint-disable-next-line */
  }, [open]);

  return (
    <Modal onClose={() => setOpen(false)} open={open}>
      <Modal.Header>
        Share this page{' '}
        <Icon
          name="close"
          style={{ float: 'right', cursor: 'pointer' }}
          onClick={() => setOpen(false)}
        />
      </Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Grid>
            <Grid.Column mobile={12} tablet={12} computer={6}>
              <Button
                color="facebook"
                icon="facebook"
                content="Facebook"
                fluid
              />
            </Grid.Column>
            <Grid.Column mobile={12} tablet={12} computer={6}>
              <Button color="twitter" icon="twitter" content="Twitter" fluid />
            </Grid.Column>
            <Grid.Column mobile={12} tablet={12} computer={6}>
              <Button
                color="linkedin"
                icon="linkedin"
                content="Linkedin"
                fluid
              />
            </Grid.Column>
            <Grid.Column mobile={12} tablet={12} computer={6}>
              <Button color="mail" icon="mail" content="Mail" fluid />
            </Grid.Column>
            <Grid.Column mobile={12}>
              <Segment secondary>
                <button
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (navigator) {
                      navigator.clipboard.writeText(url);
                      setCoping(true);
                      setCopied(false);
                      setTimeout(() => {
                        setCoping(false);
                        setCopied(true);
                      }, 500);
                    }
                  }}
                >
                  <span>{url}</span>{' '}
                  {coping ? (
                    <Icon name="spinner" size="small" loading />
                  ) : (
                    <Icon name={copied ? 'check' : 'copy'} size="small" />
                  )}
                </button>
              </Segment>
            </Grid.Column>
          </Grid>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

export default compose(
  connect((state) => ({
    content: state.content.data,
  })),
)(Banner);
