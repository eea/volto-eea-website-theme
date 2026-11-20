import { Segment, Grid, Label } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { getWidget } from '@plone/volto/helpers/Widget/utils';

/**
 * Volto 18 has no FieldsetView, `razzle.extend.js` points the Volto 19 import
 * here so the DefaultView shadow builds on both versions. Renders a fieldset
 * the way the Volto 18 DefaultView does.
 */
const FieldsetView = ({ fieldset, schema, data }) => {
  const { views } = config.widgets;

  return (
    <div className="fieldset">
      {fieldset.id !== 'default' && <h2>{fieldset.title}</h2>}
      {fieldset.fields?.map((f, key) => {
        const field = {
          ...schema?.properties[f],
          id: f,
          widget: getWidget(f, schema?.properties[f]),
        };
        const Widget = views?.getWidget(field);
        return f !== 'title' ? (
          <Grid celled="internally" key={key}>
            <Grid.Row>
              <Label title={field.id}>{field.title}:</Label>
            </Grid.Row>
            <Grid.Row>
              <Segment basic>
                <Widget value={data[f]} />
              </Segment>
            </Grid.Row>
          </Grid>
        ) : (
          <Widget key={key} value={data[f]} />
        );
      })}
    </div>
  );
};

export default FieldsetView;
