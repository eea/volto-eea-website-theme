import { Grid } from 'semantic-ui-react';
import cx from 'classnames';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';
import { withBlockExtensions } from '@plone/volto/helpers/Extensions';
import config from '@plone/volto/registry';

const convertTeaserToGridIfNecessaryAndTransformEmptyBlocksToSlate = (data) => {
  if (data?.['@type'] === 'teaserGrid') {
    return {
      ...data,
      '@type': 'gridBlock',
      blocks_layout: { items: data?.columns.map((column) => column.id) },
      blocks: data?.columns?.reduce(
        (blocks, column) => ({
          ...blocks,
          [column?.id]: {
            ...column,
            '@type': column['@type'] || 'slate',
          },
        }),
        {},
      ),
    };
  }

  if (data.blocks) {
    return {
      ...data,
      blocks: Object.keys(data.blocks).reduce(
        (blocks, blockId) => ({
          ...blocks,
          [blockId]: {
            ...data.blocks[blockId],
            '@type': data.blocks[blockId]?.['@type'] || 'slate',
          },
        }),
        {},
      ),
    };
  }

  return data;
};

const GridBlockView = (props) => {
  const { data, path, className, style } = props;
  const metadata = props.metadata || props.properties;
  const columns = data?.blocks_layout?.items || data?.columns;
  const blocksConfig =
    config.blocks.blocksConfig[data['@type']].blocksConfig ||
    props.blocksConfig;
  const location = {
    pathname: path,
  };
  return (
    <div
      className={cx('block', data['@type'], className, {
        one: columns?.length === 1,
        two: columns?.length === 2,
        three: columns?.length === 3,
        four: columns?.length === 4,
      })}
      style={style}
    >
      {data.headline && <h2 className="headline">{data.headline}</h2>}

      <Grid stackable stretched columns={columns?.length}>
        <RenderBlocks
          {...props}
          blockWrapperTag={Grid.Column}
          metadata={metadata}
          content={convertTeaserToGridIfNecessaryAndTransformEmptyBlocksToSlate(
            data,
          )}
          location={location}
          blocksConfig={blocksConfig}
          isContainer
        />
      </Grid>
    </div>
  );
};

export default withBlockExtensions(GridBlockView);
