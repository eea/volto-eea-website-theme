import { useSelector } from 'react-redux';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';

// const Helmet = () => null;

export default function BaseTag(props) {
  const contentId = useSelector((store) => store?.content?.data?.['@id']);
  // base={{ target: '_blank', href: `${contentId}/` }}
  return contentId && __CLIENT__ ? <Helmet /> : null;
}
