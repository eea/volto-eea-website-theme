export default function apiEnhencar(middlewares) {
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
