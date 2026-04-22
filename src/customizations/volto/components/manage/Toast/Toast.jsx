import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Message } from 'semantic-ui-react';
import Icon from '@plone/volto/components/theme/Icon/Icon';

import successSVG from '@plone/volto/icons/ready.svg';
import infoSVG from '@plone/volto/icons/info.svg';
import errorSVG from '@plone/volto/icons/error.svg';
import warningSVG from '@plone/volto/icons/warning.svg';

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

  function getIcon(status) {
    if (status === 'info') {
      return infoSVG;
    } else if (status === 'success') {
      return successSVG;
    } else if (status === 'error') {
      return errorSVG;
    } else if (status === 'warning') {
      return warningSVG;
    } else {
      return successSVG;
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
      <Icon
        className="icon eea-toast__icon"
        name={getIcon(status)}
        size="18px"
      />
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
