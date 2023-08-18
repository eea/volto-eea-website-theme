import { useSelector } from 'react-redux';
// import { Helmet } from '@plone/volto/helpers';

const Helmet = () => null;

export default function BaseTag(props) {
  const contentId = useSelector((store) => store?.content?.data?.['@id']);
  return contentId ? (
    <Helmet base={{ target: '_blank', href: `${contentId}/` }} />
  ) : null;
}