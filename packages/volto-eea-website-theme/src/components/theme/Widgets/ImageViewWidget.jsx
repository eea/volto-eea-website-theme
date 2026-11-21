import Image from '@plone/volto/components/theme/Image/Image';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

export default function ImageViewWidget({ value }) {
  return (
    <Image
      src={flattenToAppURL(value?.download || '')}
      alt={value?.filename || ''}
    />
  );
}
