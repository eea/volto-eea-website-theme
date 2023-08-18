import { useSelector } from 'react-redux';
import { flattenToAppURL, Helmet } from '@plone/volto/helpers';

export default function BaseTag(props) {
  const contentId = useSelector((store) => store?.content?.data?.['@id']);
  const baseHref = contentId ? flattenToAppURL(contentId) : null;

  return baseHref !== null ? (
    <Helmet base={{ target: '_blank', href: `${baseHref}/` }} />
  ) : null;
}
