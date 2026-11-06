import { LeadImageBlockSchema, LeadImageSchema } from './schema';

const intl = { formatMessage: (message) => message.defaultMessage };

const fieldsOf = (schema) => schema.fieldsets.flatMap((f) => f.fields);

describe('LeadImage schema', () => {
  it('exports LeadImageBlockSchema, registered by Volto >= 19.6', () => {
    expect(LeadImageBlockSchema).toBe(LeadImageSchema);
  });

  it('reads the block data from formData', () => {
    const schema = LeadImageSchema({ formData: { image: 'x' }, intl });
    expect(fieldsOf(schema)).toEqual(
      expect.arrayContaining(['alt', 'align', 'href', 'copyright']),
    );
  });

  it('reads the block data from data, as the blocks schema endpoint does', () => {
    const schema = LeadImageSchema({ data: { image: 'x' }, intl });
    expect(fieldsOf(schema)).toEqual(expect.arrayContaining(['alt', 'href']));
  });

  it('works without any block data', () => {
    const schema = LeadImageSchema({ intl });
    expect(fieldsOf(schema)).not.toContain('alt');
    expect(fieldsOf(schema)).toContain('copyright');
  });
});
