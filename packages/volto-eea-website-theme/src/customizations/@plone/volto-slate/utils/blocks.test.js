import config from '@plone/volto/registry';
import { clearList, getAllBlocks, normalizeExternalData } from './blocks';

describe('Blocks utils', () => {
  describe('Get all blocks', () => {
    it('Basic empty test', () => {
      const metadata = {};
      const blocks = getAllBlocks(metadata, []);
      expect(blocks).toEqual([]);
    });

    it('Empty blocks', () => {
      const metadata = {
        blocks: {},
        blocks_layout: {},
      };
      const blocks = getAllBlocks(metadata, []);
      expect(blocks).toEqual([]);
    });

    it('Empty blocks with items', () => {
      const metadata = {
        blocks: {},
        blocks_layout: { items: [] },
      };
      const blocks = getAllBlocks(metadata, []);
      expect(blocks).toEqual([]);
    });

    it('One level of blocks', () => {
      const metadata = {
        blocks: { a: {} },
        blocks_layout: { items: ['a'] },
      };
      const blocks = getAllBlocks(metadata, []);
      expect(blocks).toEqual([{ id: 'a' }]);
    });

    it('Two level of blocks w/o data', () => {
      const metadata = {
        blocks: {
          a: {
            blocks: {
              b: { type: 'text' },
            },
            blocks_layout: {
              items: ['b'],
            },
          },
        },
        blocks_layout: {
          items: ['a'],
        },
      };
      const blocks = getAllBlocks(metadata, []);
      expect(blocks).toEqual([
        { id: 'b', ...metadata.blocks.a.blocks.b },
        { id: 'a', ...metadata.blocks.a },
      ]);
    });

    it('Two level of blocks w/ data', () => {
      const metadata = {
        blocks: {
          a: {
            data: {
              blocks: {
                b: { type: 'text' },
              },
              blocks_layout: {
                items: ['b'],
              },
            },
          },
        },
        blocks_layout: {
          items: ['a'],
        },
      };
      const blocks = getAllBlocks(metadata, []);
      expect(blocks).toEqual([
        { id: 'b', ...metadata.blocks.a.data.blocks.b },
        { id: 'a', ...metadata.blocks.a },
      ]);
    });

    it('Three level of blocks', () => {
      const metadata = {
        blocks: {
          a: {
            data: {
              blocks: {
                a1: { type: 'text' },
                a2: {
                  type: 'text',
                  blocks: {
                    a21: { type: 'image' },
                    a22: { type: 'image' },
                  },
                  blocks_layout: {
                    items: ['a21', 'a22'],
                  },
                },
              },
              blocks_layout: {
                items: ['a1', 'a2'],
              },
            },
          },
          b: {
            data: {
              blocks: {
                b1: { type: 'text' },
                b2: { type: 'text' },
              },
              blocks_layout: {
                items: ['b1', 'b2'],
              },
            },
          },
        },
        blocks_layout: {
          items: ['a', 'b'],
        },
      };
      const blocks = getAllBlocks(metadata, []);
      expect(blocks).toEqual([
        { id: 'a1', ...metadata.blocks.a.data.blocks.a1 },
        { id: 'a21', ...metadata.blocks.a.data.blocks.a2.blocks.a21 },
        { id: 'a22', ...metadata.blocks.a.data.blocks.a2.blocks.a22 },
        { id: 'a2', ...metadata.blocks.a.data.blocks.a2 },
        { id: 'a', ...metadata.blocks.a },
        { id: 'b1', ...metadata.blocks.b.data.blocks.b1 },
        { id: 'b2', ...metadata.blocks.b.data.blocks.b2 },
        { id: 'b', ...metadata.blocks.b },
      ]);
    });
  });
});

const p = (text) => ({ type: 'p', children: [{ text }] });
const editor = { _installedPlugins: [] };

// Regression tests for the Microsoft Word paste fix (refs #265782).
describe('normalizeExternalData', () => {
  beforeAll(() => {
    config.settings.slate = {
      ...config.settings.slate,
      extensions: config.settings.slate?.extensions || [],
    };
  });

  it('keeps loose text between paragraphs in its own paragraph', () => {
    expect(
      normalizeExternalData(editor, [p('a'), { text: 'b' }, p('c')]),
    ).toEqual([p('a'), p('b'), p('c')]);
  });

  it('does not merge loose text into the following paragraph', () => {
    expect(normalizeExternalData(editor, [{ text: 'a' }, p('b')])).toEqual([
      p('a'),
      p('b'),
    ]);
  });

  it('does not merge loose text into the preceding paragraph', () => {
    expect(
      normalizeExternalData(editor, [{ text: 'a' }, p('b'), { text: 'c' }]),
    ).toEqual([p('a'), p('b'), p('c')]);
  });

  it('wraps typeless elements in a paragraph', () => {
    const [node] = normalizeExternalData(editor, [
      { children: [{ text: 'word' }] },
    ]);
    expect(node.type).toBe('p');
  });

  it('keeps consecutive text nodes in one paragraph', () => {
    expect(
      normalizeExternalData(editor, [{ text: 'a' }, { text: 'b', bold: true }]),
    ).toEqual([
      { type: 'p', children: [{ text: 'a' }, { text: 'b', bold: true }] },
    ]);
  });

  it('returns an empty document when there are no nodes', () => {
    expect(normalizeExternalData(editor, undefined)).toEqual([]);
  });
});

describe('clearList', () => {
  it('is exported, as in upstream volto-slate', () => {
    expect(typeof clearList).toBe('function');
  });
});
