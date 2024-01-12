//this should be deleted when upgraded to a volto version that supports App Extras exceptions
import React from 'react';
import { matchPath } from 'react-router';
import config from '@plone/volto/registry';

const AppExtras = (props) => {
  const { settings } = config;
  const { appExtras = [] } = settings;
  const { pathname } = props;
  const active = appExtras
    .map((reg) => {
      const match = matchPath(pathname, reg.match);
      const excluded = matchPath(pathname, reg.exclude);
      return !excluded && match ? { reg, match } : null;
    })
    .filter((reg) => reg);

  return active.map(({ reg: { component, props: extraProps }, match }, i) => {
    const Insert = component;
    return (
      <Insert key={`appextra-${i}`} match={match} {...props} {...extraProps} />
    );
  });
};

export default AppExtras;
