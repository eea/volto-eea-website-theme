import React, { useState } from 'react';
import { IntlProvider } from 'react-intl';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import ImageSidebar from './ImageSidebar';

jest.mock('@plone/volto/components/manage/Form', () => {
  const React = require('react');
  return {
    BlockDataForm: (props) =>
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () => {
              props.onChangeField('alt', 'A generated bird description.');
              props.onChangeField('alt_source', 'custom');
            },
          },
          'Apply generated alt',
        ),
        React.createElement(
          'output',
          { 'aria-label': 'block data' },
          JSON.stringify(props.formData),
        ),
      ),
  };
});

jest.mock('@plone/volto/components/theme/Icon/Icon', () => () => null);
jest.mock('@plone/volto/components/theme/Image/Image', () => () => null);
jest.mock('./schema', () => ({
  ImageSchema: () => ({ title: 'Image', fieldsets: [], properties: {} }),
}));

const initialData = {
  '@type': 'image',
  url: '/en/image.jpg',
  alt: '',
  alt_source: 'image-title',
  image_title: 'Original Image title',
};

const SidebarHarness = () => {
  const [data, setData] = useState(initialData);
  return (
    <ImageSidebar
      data={data}
      block="image-block"
      blocksConfig={{}}
      onChangeBlock={(block, nextData) => setData(nextData)}
    />
  );
};

describe('ImageSidebar', () => {
  it('preserves consecutive field updates from one user action', () => {
    render(
      <IntlProvider locale="en" messages={{}}>
        <SidebarHarness />
      </IntlProvider>,
    );

    fireEvent.click(screen.getByText('Apply generated alt'));

    expect(screen.getByLabelText('block data')).toHaveTextContent(
      '"alt":"A generated bird description."',
    );
    expect(screen.getByLabelText('block data')).toHaveTextContent(
      '"alt_source":"custom"',
    );
  });
});
