import { useEffect } from 'react';
import { Loader } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { loadLazyImages } from '@eeacms/volto-eea-website-theme/helpers/loadLazyImages';
import { setupPrintView } from '@eeacms/volto-eea-website-theme/helpers/setupPrintView';

import './style.less';

const messages = defineMessages({
  preparingDownload: {
    id: 'Preparing download',
    defaultMessage: 'Preparing download',
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

  return showLoader ? (
    <div
      id="download-print-loader"
      className="ui warning message"
      role="status"
      aria-live="polite"
    >
      <Loader active inline size="medium" />
      <div>{intl.formatMessage(messages.preparingDownload)}</div>
    </div>
  ) : null;
};

export default PrintLoader;
