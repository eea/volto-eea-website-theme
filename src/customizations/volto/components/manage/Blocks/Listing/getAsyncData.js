import { getQueryStringResults } from '@plone/volto/actions';
import { resolveBlockExtensions } from '@plone/volto/helpers';

export default function getListingBlockAsyncData({
  dispatch,
  data,
  path,
  blocksConfig,
  content,
}) {
  const { resolvedExtensions } = resolveBlockExtensions(data, blocksConfig);
  const id = data.block;

  const subrequestID = content?.UID ? `${content?.UID}-${id}` : id;

  return [
    dispatch(
      getQueryStringResults(
        path,
        {
          ...data.querystring,
          ...(resolvedExtensions?.variation?.fullobjects
            ? { fullobjects: 1 }
            : { metadata_fields: '_all' }),
        },
        subrequestID,
      ),
    ),
  ];
}
