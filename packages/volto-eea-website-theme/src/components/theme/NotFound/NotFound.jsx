import { compose } from 'redux';
import { injectIntl } from 'react-intl';
import { withRootNavigation } from '@eeacms/volto-eea-website-theme/hocs';
import NotFound from '@plone/volto/components/theme/NotFound/NotFound';

export default compose(injectIntl, withRootNavigation)(NotFound);
