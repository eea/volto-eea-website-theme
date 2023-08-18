import { useSelector } from 'react-redux';
import { flattenToAppURL, Helmet } from '@plone/volto/helpers';

export default function BaseTag(props) {
  const contentId = useSelector((store) => store?.content?.data?.['@id']);
  // const isCypress = typeof window !== 'undefined' && !window.__Cypress__;
  const baseHref = contentId ? flattenToAppURL(contentId) : null;
  // console.log('set baseHref', baseHref); // __CLIENT__ &&

  return baseHref !== null ? (
    <Helmet base={{ target: '_blank', href: `${baseHref}/` }} />
  ) : null;
}
