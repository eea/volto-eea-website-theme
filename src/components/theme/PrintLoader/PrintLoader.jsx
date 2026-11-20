import { useEffect } from 'react';
import { Button, Loader, Modal } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { loadLazyImages } from '@eeacms/volto-eea-website-theme/helpers/loadLazyImages';
import {
  cancelPrintView,
  setupPrintView,
} from '@eeacms/volto-eea-website-theme/helpers/setupPrintView';

import './style.less';

const messages = defineMessages({
  preparingDownload: {
    id: 'Preparing download',
    defaultMessage: 'Preparing download',
  },
  cancel: {
    id: 'Cancel',
    defaultMessage: 'Cancel',
  },
});

const PrintLoader = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const showLoader = useSelector((state) => state.print.isPrintLoading);

  useEffect(() => {
    const handleBeforePrint = () => {
      loadLazyImages();
    };

    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        setupPrintView(dispatch);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [dispatch]);

  return (
    <Modal
      id="download-print-loader"
      open={showLoader}
      size="mini"
      closeOnDimmerClick={false}
      closeOnEscape={false}
      closeIcon={false}
      aria-live="polite"
      aria-busy={showLoader}
    >
      <Modal.Content className="print-loader-content">
        <Loader active inline="centered" size="medium" />
        <p className="print-loader-text">
          {intl.formatMessage(messages.preparingDownload)}
        </p>
      </Modal.Content>
      <Modal.Actions>
        <Button primary compact onClick={() => cancelPrintView(dispatch)}>
          {intl.formatMessage(messages.cancel)}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default PrintLoader;
