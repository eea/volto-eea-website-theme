import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from 'semantic-ui-react';
import { loadLazyImages } from '@eeacms/volto-eea-website-theme/helpers/loadLazyImages';
import { setupPrintView } from '@eeacms/volto-eea-website-theme/helpers/setupPrintView';
import { setPrintLoading } from '@eeacms/volto-eea-website-theme/actions/print';

import './style.less';

const PrintLoader = () => {
  const dispatch = useDispatch();
  const showLoader = useSelector((state) => state.print.isPrintLoading);

  useEffect(() => {
    const handleBeforePrint = () => {
      loadLazyImages();
    };

    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        loadLazyImages();
        dispatch(setPrintLoading(true));
        setupPrintView(dispatch);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, []);

  return showLoader ? (
    <div id="download-print-loader" className="ui warning message">
      <Loader active inline size="medium" />
      <div>Preparing download</div>
    </div>
  ) : null;
};

export default PrintLoader;
