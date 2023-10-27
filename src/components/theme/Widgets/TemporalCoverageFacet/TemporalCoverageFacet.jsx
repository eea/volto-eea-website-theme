import React, { useState } from 'react';
import { Header, Input } from 'semantic-ui-react';

import './styles.less';

import { Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider';
import { SliderRail, Handle, Track, Tick } from './SliderComponents';

const getRangeStartEnd = (range) => {
  return {
    start: Math.min.apply(
      Math,
      range.map((year) => year.value),
    ),
    end: Math.max.apply(
      Math,
      range.map((year) => year.value),
    ),
  };
};

const sliderStyle = {
  position: 'relative',
  width: '100%',
};

const TemporalCoverage = (props) => {
  const { facet, onChange, choices } = props;
  const { start, end } = getRangeStartEnd(choices);
  const [startValue, setStartValue] = useState(start);
  const [endValue, setEndValue] = useState(end);

  return (
    <div>
      <Header as="h4">{facet?.title ?? facet?.field?.label}</Header>
      <div className="years-input">
        <Input
          type="number"
          value={startValue}
          onChange={(e, { value }) => {
            setStartValue(value);
            onChange(facet.field.value, [parseInt(value), endValue]);
          }}
          min={start}
          max={end}
        />
        <Input
          type="number"
          className="right"
          value={endValue}
          onChange={(e, { value }) => {
            setEndValue(value);
            onChange(facet.field.value, [startValue, parseInt(value)]);
          }}
          min={start}
          max={end}
        />
      </div>
      <Slider
        mode={2}
        step={1}
        domain={[start, end]}
        rootStyle={sliderStyle}
        onUpdate={(e) => {
          setStartValue(e?.[0]);
          setEndValue(e?.[1]);
          onChange(facet.field.value, e);
        }}
        onChange={(e) => {
          setStartValue(e?.[0]);
          setEndValue(e?.[1]);
          onChange(facet.field.value, e);
        }}
        values={[startValue, endValue]}
      >
        <Rail>
          {({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}
        </Rail>
        <Handles>
          {({ handles, activeHandleID, getHandleProps }) => (
            <div className="slider-handles">
              {handles.map((handle) => (
                <Handle
                  key={handle.id}
                  handle={handle}
                  domain={[start, end]}
                  isActive={handle.id === activeHandleID}
                  getHandleProps={getHandleProps}
                />
              ))}
            </div>
          )}
        </Handles>
        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }) => (
            <div className="slider-tracks">
              {tracks.map(({ id, source, target }) => (
                <Track
                  trackColor={'#00548a'}
                  key={id}
                  source={source}
                  target={target}
                  getTrackProps={getTrackProps}
                />
              ))}
            </div>
          )}
        </Tracks>
        <Ticks count={5}>
          {({ ticks }) => (
            <div className="slider-ticks">
              {ticks.map((tick) => (
                <Tick key={tick.id} tick={tick} count={ticks.length} />
              ))}
            </div>
          )}
        </Ticks>
      </Slider>
    </div>
  );
};

TemporalCoverage.stateToValue = ({ facetSettings, index, selectedValue }) => {
  return selectedValue || [null, null];
};

TemporalCoverage.valueToQuery = ({ value, facet }) => {
  let years = Array.from({ length: value?.[1] - value?.[0] + 1 }, (_, index) =>
    (value?.[0] + index).toString(),
  );

  return value
    ? {
        i: facet.field.value,
        o: 'plone.app.querystring.operation.list.contains',
        v: years,
      }
    : null;
};

export default TemporalCoverage;
