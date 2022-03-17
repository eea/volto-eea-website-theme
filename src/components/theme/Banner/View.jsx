import React, { useMemo } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Container } from 'semantic-ui-react';
import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import Banner from './Banner';
import { addBookmark } from './Banner';

const View = (props) => {
  const { content, toastify, moment } = props;
  const publishingDate = useMemo(
    () => (content['effective'] ? moment.default(content['effective']) : null),
    [content, moment],
  );
  const modificationDate = useMemo(
    () => (content['modified'] ? moment.default(content['modified']) : null),
    [content, moment],
  );
  return (
    <Banner {...props}>
      <Container>
        <Banner.Content
          actions={
            <>
              <Banner.Action
                icon="bookmark outline"
                title="Bookmark"
                className="bookmark"
                onClick={() => {
                  addBookmark(content['@id'], content['title'], toastify.toast);
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
          <Banner.Title>{content['title']}</Banner.Title>
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
    </Banner>
  );
};

export default compose(
  injectLazyLibs(['toastify', 'moment']),
  connect((state) => ({
    content: state.content.data,
  })),
)(View);
