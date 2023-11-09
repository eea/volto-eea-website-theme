import React from 'react';
import withDeviceSize from './withDeviceSize';

import { render } from '@testing-library/react';

describe('withDeviceSize', () => {
  const Block = (props) => {
    return (
      <>
        <div>My Block</div>
      </>
    );
  };
  it('calculates size based on browser widths', () => {
    const ExtendedBlock = withDeviceSize(Block);
    const data = { '@type': 'testBlock' };
    const { container } = render(<ExtendedBlock data={data} />);
    expect(container).toMatchSnapshot();
  });
});
