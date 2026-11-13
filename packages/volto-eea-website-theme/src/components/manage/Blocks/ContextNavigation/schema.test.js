import { EditSchema } from './schema';

describe('ContextNavigation EditSchema children sort', () => {
  const schema = EditSchema({ availableTypes: [['News Item', 'News Item']] });

  it('puts the children sort fields in a dedicated Filters fieldset', () => {
    const filters = schema.fieldsets.find(
      (fieldset) => fieldset.id === 'filters',
    );

    expect(filters.title).toBe('Filters');
    expect(filters.fields).toEqual([
      'children_sort_type',
      'children_sort_on',
      'children_sort_order',
    ]);
    expect(schema.fieldsets[0].fields).not.toContain('children_sort_type');
  });

  it('offers a multi choice for the child type and an order select', () => {
    expect(schema.properties.children_sort_type.isMulti).toBe(true);
    expect(schema.properties.children_sort_order.choices).toEqual([
      ['ascending', 'Ascending'],
      ['descending', 'Descending'],
    ]);
  });
});
