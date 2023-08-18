import { useSelector } from 'react-redux';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';

export default function BaseTag(props) {
  const contentId = useSelector((store) => store?.content?.data?.['@id']);
  const isCypress = typeof window !== 'undefined' && !window.__Cypress__;

  return contentId && !isCypress ? (
    <Helmet base={{ target: '_blank', href: `${contentId}/` }} />
  ) : null;
}
