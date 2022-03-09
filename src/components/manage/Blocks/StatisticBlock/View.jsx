import React from 'react';
import { Statistic } from 'semantic-ui-react';

const View = ({ data, mode }) => {
  const {
    horizontal = false,
    inverted = false,
    size = 'small',
    widths = 'one',
    items = [],
  } = data;

  if (!items.length && mode === 'edit') return <p>Add statistic items</p>;
  return (
    <div>
      <Statistic.Group
        horizontal={horizontal}
        inverted={inverted}
        size={size}
        widths={widths}
      >
        {items.map((item, index) => {
          return (
            <Statistic
              key={`${index}-${item.label}`}
              className="eea-statistics"
            >
              <Statistic.Value>{item.value}</Statistic.Value>
              <Statistic.Label>{item.label}</Statistic.Label>
            </Statistic>
          );
        })}
      </Statistic.Group>
    </div>
  );
};

export default View;
