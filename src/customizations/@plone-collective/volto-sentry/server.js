import * as Sentry from '@sentry/node';
import * as SentryIntegrations from '@sentry/integrations';

import initSentry from '@plone-collective/volto-sentry/sentry';

export default function apply() {
  initSentry({ Sentry, SentryIntegrations });
}

export const captureSSRException = (error, context = {}) => {
  if (process.env.RAZZLE_SENTRY_DSN || (typeof __SENTRY__ !== 'undefined' && __SENTRY__.SENTRY_DSN)) {
    try {
      Sentry.withScope((scope) => {
        scope.setTag('errorType', 'SSR');
        scope.setContext('SSR Context', context);
        if (context.url) {
          scope.setTag('url', context.url);
        }
        if (context.statusCode) {
          scope.setTag('statusCode', context.statusCode.toString());
        }
        if (context.stage) {
          scope.setTag('stage', context.stage);
        }
        Sentry.captureException(error);
      });
    } catch (sentryError) {
      console.error('Failed to capture SSR error in Sentry:', sentryError);
    }
  }
  return error;
};