import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

const preferredScales = ['preview', 'teaser', 'large', 'mini'];

export const getSubsiteLogo = (subsite) => {
  const image = subsite?.subsite_logo;

  if (!image) return null;

  const scale = preferredScales
    .map((name) => image.scales?.[name])
    .find((item) => item?.download);
  const download = scale?.download || image.download;

  if (!download) return null;

  return {
    src: flattenToAppURL(download),
    width: scale?.width || image.width,
    height: scale?.height || image.height,
    alt: subsite.title,
    url: flattenToAppURL(subsite['@id']),
  };
};
