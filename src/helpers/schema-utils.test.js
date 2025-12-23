import {
  addStylingFieldsetSchemaEnhancer,
  addStylingFieldsetSchemaEnhancerImagePosition,
  getVoltoStyles,
  ALIGN_INFO_MAP,
} from './schema-utils';

jest.mock(
  '@eeacms/volto-eea-website-theme/icons/image-narrow.svg',
  () => 'image-narrow-svg',
);
jest.mock('@plone/volto/icons/image-fit.svg', () => 'image-fit-svg');
jest.mock('@plone/volto/icons/image-wide.svg', () => 'image-wide-svg');
jest.mock('@plone/volto/icons/image-full.svg', () => 'image-full-svg');
jest.mock('@plone/volto/icons/move-up.svg', () => 'move-up-svg');
jest.mock('@plone/volto/icons/row.svg', () => 'row-svg');
jest.mock('@plone/volto/icons/move-down.svg', () => 'move-down-svg');

jest.mock('@plone/volto/helpers', () => ({
  addStyling: jest.fn((props) => ({
    properties: {
      styles: {
        schema: {
          properties: {},
          fieldsets: [{ fields: [] }],
        },
      },
    },
  })),
}));

describe('schema-utils', () => {
  describe('ALIGN_INFO_MAP', () => {
    it('should have narrow_width entry', () => {
      expect(ALIGN_INFO_MAP.narrow_width).toBeDefined();
      expect(ALIGN_INFO_MAP.narrow_width[1]).toBe('Narrow width');
    });

    it('should have container_width entry', () => {
      expect(ALIGN_INFO_MAP.container_width).toBeDefined();
      expect(ALIGN_INFO_MAP.container_width[1]).toBe('Container width');
    });

    it('should have wide_width entry', () => {
      expect(ALIGN_INFO_MAP.wide_width).toBeDefined();
      expect(ALIGN_INFO_MAP.wide_width[1]).toBe('Wide width');
    });

    it('should have full entry', () => {
      expect(ALIGN_INFO_MAP.full).toBeDefined();
      expect(ALIGN_INFO_MAP.full[1]).toBe('Full width');
    });
  });

  describe('addStylingFieldsetSchemaEnhancer', () => {
    it('should add size property to schema', () => {
      const props = { schema: {} };
      const result = addStylingFieldsetSchemaEnhancer(props);

      expect(result.properties.styles.schema.properties.size).toBeDefined();
      expect(result.properties.styles.schema.properties.size.widget).toBe(
        'style_align',
      );
      expect(result.properties.styles.schema.properties.size.title).toBe(
        'Section size',
      );
    });

    it('should set correct actions from ALIGN_INFO_MAP keys', () => {
      const props = { schema: {} };
      const result = addStylingFieldsetSchemaEnhancer(props);

      const expectedActions = [
        'narrow_width',
        'container_width',
        'wide_width',
        'full',
      ];
      expect(result.properties.styles.schema.properties.size.actions).toEqual(
        expectedActions,
      );
    });

    it('should set actionsInfoMap to ALIGN_INFO_MAP', () => {
      const props = { schema: {} };
      const result = addStylingFieldsetSchemaEnhancer(props);

      expect(
        result.properties.styles.schema.properties.size.actionsInfoMap,
      ).toBe(ALIGN_INFO_MAP);
    });

    it('should add size to fieldset fields', () => {
      const props = { schema: {} };
      const result = addStylingFieldsetSchemaEnhancer(props);

      expect(result.properties.styles.schema.fieldsets[0].fields).toContain(
        'size',
      );
    });
  });

  describe('addStylingFieldsetSchemaEnhancerImagePosition', () => {
    it('should add objectPosition property to schema', () => {
      const props = { schema: {} };
      const result = addStylingFieldsetSchemaEnhancerImagePosition(props);

      expect(
        result.properties.styles.schema.properties.objectPosition,
      ).toBeDefined();
      expect(
        result.properties.styles.schema.properties.objectPosition.title,
      ).toBe('Image position');
      expect(
        result.properties.styles.schema.properties.objectPosition.widget,
      ).toBe('style_align');
    });

    it('should set correct actions for image position', () => {
      const props = { schema: {} };
      const result = addStylingFieldsetSchemaEnhancerImagePosition(props);

      const expectedActions = [
        'has--object-position--top',
        'has--object-position--center',
        'has--object-position--bottom',
      ];
      expect(
        result.properties.styles.schema.properties.objectPosition.actions,
      ).toEqual(expectedActions);
    });

    it('should set defaultValue to center', () => {
      const props = { schema: {} };
      const result = addStylingFieldsetSchemaEnhancerImagePosition(props);

      expect(
        result.properties.styles.schema.properties.objectPosition.defaultValue,
      ).toBe('has--object-position--center');
    });

    it('should add objectPosition to fieldset fields', () => {
      const props = { schema: {} };
      const result = addStylingFieldsetSchemaEnhancerImagePosition(props);

      expect(result.properties.styles.schema.fieldsets[0].fields).toContain(
        'objectPosition',
      );
    });
  });

  describe('getVoltoStyles', () => {
    it('should return empty object for undefined props', () => {
      const result = getVoltoStyles(undefined);

      expect(result).toEqual({});
    });

    it('should return empty object for null props', () => {
      const result = getVoltoStyles(null);

      expect(result).toEqual({});
    });

    it('should return empty object for empty props', () => {
      const result = getVoltoStyles({});

      expect(result).toEqual({});
    });

    it('should skip @type key', () => {
      const result = getVoltoStyles({
        '@type': 'someBlock',
        'some-class': 'some-class',
      });

      expect(result).not.toHaveProperty('@type');
      expect(result).toHaveProperty('some-class');
    });

    it('should use key as value when value is true', () => {
      const result = getVoltoStyles({
        'has-border': true,
        'is-rounded': true,
      });

      expect(result).toEqual({
        'has-border': 'has-border',
        'is-rounded': 'is-rounded',
      });
    });

    it('should use value as both key and value for non-boolean values', () => {
      const result = getVoltoStyles({
        theme: 'dark',
        size: 'large',
      });

      expect(result).toEqual({
        dark: 'dark',
        large: 'large',
      });
    });

    it('should handle array values by spreading each element', () => {
      const result = getVoltoStyles({
        classes: ['class-a', 'class-b', 'class-c'],
      });

      expect(result).toEqual({
        'class-a': 'class-a',
        'class-b': 'class-b',
        'class-c': 'class-c',
      });
    });

    it('should handle mixed values correctly', () => {
      const result = getVoltoStyles({
        '@type': 'block',
        'is-active': true,
        theme: 'primary',
        modifiers: ['mod-1', 'mod-2'],
      });

      expect(result).toEqual({
        'is-active': 'is-active',
        primary: 'primary',
        'mod-1': 'mod-1',
        'mod-2': 'mod-2',
      });
    });

    it('should handle false boolean values', () => {
      const result = getVoltoStyles({
        'is-hidden': false,
      });

      expect(result).toEqual({
        false: false,
      });
    });

    it('should handle empty array values', () => {
      const result = getVoltoStyles({
        classes: [],
      });

      expect(result).toEqual({});
    });

    it('should handle numeric values', () => {
      const result = getVoltoStyles({
        width: 100,
      });

      expect(result).toEqual({
        100: 100,
      });
    });
  });
});
