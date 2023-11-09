import { getImageScaleParams } from './index';
import { isInternalURL, flattenToAppURL } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

beforeAll(() => {
  config.blocks.blocksConfig = {
    ...config.blocks.blocksConfig,
    teaser: {
      ...config.blocks.blocksConfig.teaser,
      imageScale: 'test_scale',
    },
  };
});

jest.mock('@plone/volto/helpers', () => ({
  isInternalURL: jest.fn(),
  flattenToAppURL: jest.fn(),
}));

describe('test', () => {
  it('should return the scaled image URL if image scales are provided and is an internal URL', () => {
    const image = {
      '@id': 'internalURL',
      image_field: 'test_field',
      image_scales: {
        test_field: [
          {
            download: '/en/@@images/test_field-example.jpg',
            scales: {
              test_scale: {
                download: '/en/@@images/test_field-example-123.jpg',
              },
            },
          },
        ],
      },
    };
    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockReturnValue('/en/@@images/test_field-example-123.jpg');
    const result = getImageScaleParams(image);

    expect(isInternalURL).toHaveBeenCalledWith('internalURL');
    expect(result.download).toBe(`/en/@@images/test_field-example-123.jpg`);
  });

  it('should return the default scaled image URL if image scales are not provided', () => {
    const image = {
      '@id': 'internalURL',
      image_field: 'test_field',
      image_scales: {
        test_field: [
          {
            download: '/en/@@images/test_field-example.jpg',
          },
        ],
      },
    };
    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockReturnValue('/en/@@images/test_field-example.jpg');
    const result = getImageScaleParams(image);

    expect(isInternalURL).toHaveBeenCalledWith('internalURL');
    expect(result.download).toBe(`/en/@@images/test_field-example.jpg`);
  });

  it('should return the image URL if image is provided and is not an internal URL', () => {
    const image = {
      '@id': 'internalURL',
    };
    isInternalURL.mockReturnValue(false);
    const result = getImageScaleParams(image);

    expect(isInternalURL).toHaveBeenCalledWith('internalURL');
    expect(result.download).toBe('internalURL');
  });

  // ensure backward compatibilty tests
  it('should return the default image URL if no image is provided without image_field', () => {
    const image = {
      '@id': 'internalURL',
      image_field: null,
    };
    isInternalURL.mockReturnValue(true);
    flattenToAppURL.mockReturnValue(
      'internalURL/@@images/preview_image/test_scale',
    );
    const result = getImageScaleParams(image);

    expect(result.download).toBe(
      'internalURL/@@images/preview_image/test_scale',
    );
  });

  it('should return the default image URL if no image scales are provided with image_field', () => {
    const image = {
      '@id': 'internalURL',
      image_field: 'mock_image',
      image_scales: null,
    };
    isInternalURL.mockReturnValue(true);
    const result = getImageScaleParams(image);

    expect(result.download).toBe(
      'internalURL/@@images/preview_image/test_scale',
    );
  });
});
