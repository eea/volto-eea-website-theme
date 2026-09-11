import config from '@plone/volto/registry';

const ok = function (req, res, next) {
  res.type('text/plain');
  res.set('Expires', 'Sat, 1 Jan 2000 00:00:00 GMT');
  res.set('Cache-Control', 'max-age=0, must-revalidate, private');
  res.send('ok');
};

const okMiddleware = function (express) {
  const middleware = express.Router();
  middleware.all(config?.settings?.okRoute || '/ok', ok);
  middleware.id = 'ok';
  return middleware;
};

export default okMiddleware;
