import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { getBaseUrl, hasApiExpander } from '@plone/volto/helpers';
import { getNavigation } from '@plone/volto/actions';
import config from '@plone/volto/registry';

export default function withRootNavigation(WrappedComponent) {
  return connect(
    (state) => {
      return {
        items: state.navigation.items,
        lang: state.intl.locale,
      };
    },
    { getNavigation },
  )((props) => {
    const dispatch = useDispatch();
    React.useEffect(() => {
      const { settings } = config;
      const currentLang = props.lang;
      const base_url = getBaseUrl(`/${currentLang}`);
      if (!hasApiExpander('navigation', base_url)) {
        dispatch(getNavigation(base_url, settings.navDepth));
      }
    }, [props.lang, dispatch]);

    return <WrappedComponent {...props} items={props.items} />;
  });
}
