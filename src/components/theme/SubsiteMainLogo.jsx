import React from 'react';
import { Image } from 'semantic-ui-react';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import Helmet from '@plone/volto/helpers/Helmet/Helmet';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';

/**
 * Subsite logo rendered in place of the EEA logo, fitted inside the EEA logo
 * box (width x height) without changing its own ratio.
 * @param {Object} props.subsite The @components.subsite expansion data
 * @param {number} props.width The EEA logo width
 * @param {number} props.height The EEA logo height
 */
const SubsiteMainLogo = ({ subsite, width, height }) => {
  const { subsite_logo } = subsite;
  const src = flattenToAppURL(
    (subsite_logo.scales.preview || subsite_logo).download,
  );

  return (
    <>
      <Helmet>
        {/* Preload the logo so its alt text is not shown during SSR */}
        <link rel="preload" as="image" href={src} fetchpriority="high" />
      </Helmet>
      <UniversalLink item={subsite} title={subsite.title} className="logo">
        <Image
          src={src}
          alt={subsite.title}
          className="eea-logo"
          width={width}
          height={height}
          fetchpriority="high"
          style={{
            aspectRatio: width && height ? `${width} / ${height}` : undefined,
            objectFit: 'contain',
            objectPosition: 'left center',
            // hide the alt text while the image is loading
            color: 'transparent',
          }}
        />
      </UniversalLink>
    </>
  );
};

export default SubsiteMainLogo;
