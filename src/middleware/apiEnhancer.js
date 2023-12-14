export default function apiEnhancer(middlewares) {
  return [
    () => (next) => (action) => {
      if (action.request) {
        return next({ ...action, _request: action.request });
      }
      return next(action);
    },
    ...middlewares,
  ];
}
