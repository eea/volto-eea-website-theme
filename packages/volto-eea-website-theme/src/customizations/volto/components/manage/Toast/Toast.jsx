import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Icon, Message } from 'semantic-ui-react';

const Toast = (props) => {
  function getStatus(props) {
    if (props.info) {
      return 'info';
    } else if (props.success) {
      return 'success';
    } else if (props.error) {
      return 'error';
    } else if (props.warning) {
      return 'warning';
    } else {
      return 'success';
    }
  }

  const { title, content } = props;
  const status = getStatus(props);
  const statusProps = {
    info: status === 'info',
    success: status === 'success',
    error: status === 'error',
    warning: status === 'warning',
  };

  return (
    <Message
      icon
      size="large"
      className={cx('eea-toast', `eea-toast--${status}`)}
      {...statusProps}
    >
      <Icon name="exclamation circle" />
      <Message.Content className="toast-inner-content">
        {title && <Message.Header>{title}</Message.Header>}
        <div>{content}</div>
      </Message.Content>
    </Message>
  );
};

Toast.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  info: PropTypes.bool,
  success: PropTypes.bool,
  error: PropTypes.bool,
  warning: PropTypes.bool,
};

export default Toast;
