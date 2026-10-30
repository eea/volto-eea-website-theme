import React, { useState } from 'react';
import { IntlProvider } from 'react-intl';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import ImageSidebar from './ImageSidebar';

jest.mock('@plone/volto/components/manage/Form/BlockDataForm', () => {
  const React = require('react');
  return (props) =>
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
    );
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

  it('clears linked alt and image metadata when clearing the image', () => {
    let currentData = {
      '@type': 'image',
      url: '/en/image.jpg',
      alt: 'Linked metadata',
      alt_source: 'image-metadata',
      image_title: 'Original Image title',
      image_description: 'Original Image description',
      image_metadata: 'Original Image title: Original Image description',
    };

    const Harness = () => {
      const [data, setData] = useState(currentData);
      return (
        <ImageSidebar
          data={data}
          block="image-block"
          blocksConfig={{}}
          onChangeBlock={(block, nextData) => {
            currentData = nextData;
            setData(nextData);
          }}
        />
      );
    };

    render(
      <IntlProvider locale="en" messages={{}}>
        <Harness />
      </IntlProvider>,
    );

    const clearButton = screen.getByTitle('Clear image');
    fireEvent.click(clearButton);

    expect(currentData.url).toBeUndefined();
    expect(currentData.alt).toBeUndefined();
    expect(currentData.alt_source).toBeUndefined();
    expect(currentData.image_title).toBeUndefined();
    expect(currentData.image_description).toBeUndefined();
    expect(currentData.image_metadata).toBeUndefined();
  });
});
