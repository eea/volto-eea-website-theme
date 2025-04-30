import React from 'react';
import renderer from 'react-test-renderer';
import CreatorsViewWidget from './CreatorsViewWidget';

describe('CreatorsViewWidget', () => {
  it('renders an empty array view widget component', () => {
    const component = renderer.create(<CreatorsViewWidget />);
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a simple array view widget component', () => {
    const component = renderer.create(
      <CreatorsViewWidget className="metadata" value={['foo', 'bar']} />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a vocabulary array view widget component', () => {
    const component = renderer.create(
      <CreatorsViewWidget
        className="metadata"
        value={[{ title: 'Foo' }, { title: 'Bar' }]}
      />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a full vocabulary array view widget component', () => {
    const component = renderer.create(
      <CreatorsViewWidget
        className="metadata"
        value={[
          { title: 'Foo', token: 'foo' },
          { title: 'Bar', token: 'bar' },
        ]}
      />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a full vocabulary array view widget component with children', () => {
    const component = renderer.create(
      <CreatorsViewWidget
        className="metadata"
        value={[
          { title: 'Foo', token: 'foo' },
          { title: 'Bar', token: 'bar' },
        ]}
      >
        {(child) => <strong>{child}</strong>}
      </CreatorsViewWidget>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
