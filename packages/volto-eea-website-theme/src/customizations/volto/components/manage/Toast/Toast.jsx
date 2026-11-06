import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { defineMessages, useIntl } from 'react-intl';
import { Icon, Message } from 'semantic-ui-react';
import { isVolto18 } from '@eeacms/volto-eea-website-theme/helpers/voltoVersion';

const messages = defineMessages({
  success: {
    id: 'toast_type_success',
    defaultMessage: 'Success',
  },
  error: {
    id: 'toast_type_error',
    defaultMessage: 'Error',
  },
  warning: {
    id: 'toast_type_warning',
    defaultMessage: 'Warning',
  },
  info: {
    id: 'toast_type_info',
    defaultMessage: 'Information',
  },
});

const Toast = (props) => {
  const intl = useIntl();

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

  function getTypeLabel(props) {
    if (props.error) return intl.formatMessage(messages.error);
    if (props.warning) return intl.formatMessage(messages.warning);
    if (props.info) return intl.formatMessage(messages.info);
    if (props.success) return intl.formatMessage(messages.success);
    return null;
  }

  const { title, content } = props;
  const typeLabel = getTypeLabel(props);
  const status = getStatus(props);
  const statusProps = {
    info: status === 'info',
    success: status === 'success',
    error: status === 'error',
    warning: status === 'warning',
  };
  // Volto 18 names its screen reader only class `visually-hidden-volto`,
  // Volto 19 renamed it to `visually-hidden`.
  const visuallyHiddenClassName = isVolto18
    ? 'visually-hidden-volto'
    : 'visually-hidden';

  return (
    <Message
      icon
      size="large"
      className={cx('eea-toast', `eea-toast--${status}`)}
      {...statusProps}
    >
      <Icon name="exclamation circle" />
      <Message.Content className="toast-inner-content">
        {typeLabel && (
          <span className={visuallyHiddenClassName}>{typeLabel}</span>
        )}
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
