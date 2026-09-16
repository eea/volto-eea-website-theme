import { getSubsiteLogo } from './subsiteLogo';

describe('getSubsiteLogo', () => {
  it('returns the preferred image scale and subsite metadata', () => {
    expect(
      getSubsiteLogo({
        '@id': 'http://localhost:8080/Plone/en/epanet',
        title: 'EPA Network',
        subsite_logo: {
          download:
            'http://localhost:8080/Plone/en/epanet/@@images/subsite_logo',
          width: 1280,
          height: 203,
          scales: {
            mini: {
              download:
                'http://localhost:8080/Plone/en/epanet/@@images/subsite_logo/mini',
              width: 80,
              height: 13,
            },
            preview: {
              download:
                'http://localhost:8080/Plone/en/epanet/@@images/subsite_logo/preview',
              width: 400,
              height: 63,
            },
          },
        },
      }),
    ).toEqual({
      src: '/en/epanet/@@images/subsite_logo/preview',
      width: 400,
      height: 63,
      alt: 'EPA Network',
      url: '/en/epanet',
    });
  });

  it('returns null when no usable logo is configured', () => {
    expect(getSubsiteLogo()).toBeNull();
    expect(getSubsiteLogo({ subsite_logo: {} })).toBeNull();
  });
});
