import React from 'react';
import cx from 'classnames';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { BodyClass } from '@plone/volto/helpers';
import { isSubsiteRoot } from 'volto-subsites/utils';

const SubsiteClass = () => {
  const subsite = useSelector(
    (state) => state.content?.data?.['@components']?.subsite || {},
  );
  const location = useLocation();

  return (
    <BodyClass
      className={cx('subsite', `subsite-${subsite.subsite_css_class?.token}`, {
        'subsite-root': isSubsiteRoot(location.pathname, subsite),
      })}
    />
  );
};
export default SubsiteClass;
