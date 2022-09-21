import { getAPIResourceWithAuth } from '@plone/volto/helpers';

const HEADERS = [
  'Accept-Ranges',
  'Cache-Control',
  'Content-Disposition',
  'Content-Range',
  'Content-Type',
];

function voltoCustomMiddleware(req, res, next) {
  getAPIResourceWithAuth(req)
    .then((resource) => {
      // Just forward the headers that we need
      HEADERS.forEach((header) => {
        if (resource.get(header)) {
          res.set(header, resource.get(header));
        }
      });
      res.status(resource.statusCode);
      res.send(resource.body);
    })
    .catch(next);
}

export default function (express) {
  const middleware = express.Router();
  middleware.all(['**/voltoCustom.css$'], voltoCustomMiddleware);
  middleware.id = 'voltoCustom.css';
  return middleware;
}
