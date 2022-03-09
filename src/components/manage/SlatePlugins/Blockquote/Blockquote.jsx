import React from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Icon } from 'semantic-ui-react';

const blockquoteTypes = {
  blockquote: ({ children }) => {
    return (
      <div className="eea slate blockquote">
        <blockquote className="quote">{children}</blockquote>
      </div>
    );
  },
  pullquote: ({ children, element, edit }) => {
    return (
      <blockquote
        className={cx(
          'eea pullquote',
          !edit ? element.data?.position || 'none' : 'none',
        )}
      >
        <Icon name="quote left"></Icon>
        <div className="content">{children}</div>
        <Icon className="quote right" name="quote right"></Icon>
      </blockquote>
    );
  },
};

function Blockquote(props) {
  const data = props.element.data || {};
  const edit = props.location.pathname.split('/').pop() === 'edit';
  const BlockquoteElement = blockquoteTypes[data.type || 'blockquote'];
  return <BlockquoteElement {...props} edit={edit} />;
}

export default connect((state) => ({
  location: state.router.location,
}))(Blockquote);
