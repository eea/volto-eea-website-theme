import React from 'react';
import renderer from 'react-test-renderer';
import ContributorsViewWidget from './ContributorsViewWidget';

describe('ContributorsViewWidget', () => {
  it('renders an empty array view widget component', () => {
    const component = renderer.create(<ContributorsViewWidget />);
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a simple array view widget component', () => {
    const component = renderer.create(
      <ContributorsViewWidget className="metadata" value={['foo', 'bar']} />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a vocabulary array view widget component', () => {
    const component = renderer.create(
      <ContributorsViewWidget
        className="metadata"
        value={[{ title: 'Foo' }, { title: 'Bar' }]}
      />,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });

  it('renders a full vocabulary array view widget component', () => {
    const component = renderer.create(
      <ContributorsViewWidget
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
      <ContributorsViewWidget
        className="metadata"
        value={[
          { title: 'Foo', token: 'foo' },
          { title: 'Bar', token: 'bar' },
        ]}
      >
        {(child) => <strong>{child}</strong>}
      </ContributorsViewWidget>,
    );
    const json = component.toJSON();
    expect(json).toMatchSnapshot();
  });
});
