import { getBackendResourceWithAuth } from '@eeacms/volto-eea-website-theme/helpers';

const HEADERS = [
  'Accept-Ranges',
  'Cache-Control',
  'Content-Disposition',
  'Content-Range',
  'Content-Type',
];

function voltoCustomMiddleware(req, res, next) {
  getBackendResourceWithAuth(req)
    .then((resource) => {
      // Just forward the headers that we need
      HEADERS.forEach((header) => {
        if (resource?.get?.(header)) {
          res.set(header, resource.get(header));
        }
      });
      res.status(resource.statusCode);
      res.send(resource.body);
    })
    .catch(() => {
      res.set('Content-Type', 'text/css; charset=utf-8');
      res.status(200);
      res.send(
        '/* Override this by adding a File called voltoCustom.css to backend at portal_skins/custom/manage_main */',
      );
    });
}

export default function (express) {
  const middleware = express.Router();
  middleware.all(['**/voltoCustom.css$'], voltoCustomMiddleware);
  middleware.id = 'voltoCustom.css';
  return middleware;
}
