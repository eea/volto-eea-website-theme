import { useSelector } from 'react-redux';
import Helmet from '@plone/volto/helpers//Helmet/Helmet';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

export default function BaseTag(props) {
  const contentId = useSelector((store) => store?.content?.data?.['@id']);
  const baseHref = contentId ? flattenToAppURL(contentId) : null;

  return baseHref !== null ? (
    <Helmet base={{ target: '_self', href: `${baseHref}/` }} />
  ) : null;
}
