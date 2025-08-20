/**
 * Simple Array Widget that allows duplicates and direct typing
 * @module components/manage/Widgets/SimpleArrayWidget
 */

import React, { useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { Button, Input, Label } from 'semantic-ui-react';
import FormFieldWrapper from '@plone/volto/components/manage/Widgets/FormFieldWrapper';

const messages = defineMessages({
  add: {
    id: 'Add',
    defaultMessage: 'Add',
  },
  remove: {
    id: 'Remove',
    defaultMessage: 'Remove',
  },
});

const SimpleArrayWidget = (props) => {
  const { id, value: rawValue, onChange, items, intl } = props;
  const [newValue, setNewValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Get min/max from schema
  const minValue = items?.minimum || 1;
  const maxValue = items?.maximum || 10;

  // Ensure value is always an array
  const value = Array.isArray(rawValue) ? rawValue : [];

  const handleAdd = () => {
    if (newValue.trim() !== '') {
      const numValue = parseInt(newValue.trim());
      if (!isNaN(numValue) && numValue >= minValue && numValue <= maxValue) {
        const newArray = [...value, numValue];
        onChange(id, newArray);
        setNewValue('');
        setShowInput(false); // Hide input after adding
      }
    }
  };

  const handleShowInput = () => {
    setShowInput(true);
    // Focus input after it appears
    setTimeout(() => {
      const input = document.querySelector(`#${id}-input`);
      if (input) input.focus();
    }, 100);
  };

  const handleCancel = () => {
    setNewValue('');
    setShowInput(false);
  };

  const handleRemove = (index) => {
    const newArray = value.filter((_, i) => i !== index);
    // If array becomes empty, pass null to remove the field from data completely
    onChange(id, newArray.length === 0 ? null : newArray);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <FormFieldWrapper {...props}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          paddingTop: '0.5rem',
        }}
      >
        {/* Display current values as compact labels */}
        {value.map((item, index) => {
          // Force conversion to number for display (in case it comes as string)
          const displayValue =
            typeof item === 'string' ? parseInt(item) || item : item;
          return (
            <Label key={index} size="small" color="blue">
              {displayValue}
              <Label.Detail
                as="a"
                onClick={() => handleRemove(index)}
                style={{ cursor: 'pointer' }}
                title={intl.formatMessage(messages.remove)}
              >
                ×
              </Label.Detail>
            </Label>
          );
        })}

        {/* Input field (conditionally shown) */}
        {showInput && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Input
              id={`${id}-input`}
              type="number"
              min={minValue}
              max={maxValue}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`${minValue}-${maxValue}`}
              size="mini"
              style={{ width: '80px' }}
            />
            <Button
              type="button"
              primary
              size="mini"
              icon="check"
              onClick={handleAdd}
              disabled={!newValue.trim()}
              title={intl.formatMessage(messages.add)}
            />
            <Button
              type="button"
              size="mini"
              icon="close"
              onClick={handleCancel}
              title="Cancel"
            />
          </div>
        )}

        {/* Add button (shown when input is hidden) */}
        {!showInput && (
          <Button
            type="button"
            basic
            size="mini"
            icon="plus"
            content={intl.formatMessage(messages.add)}
            onClick={handleShowInput}
          />
        )}
      </div>

      {props.description && (
        <div
          style={{
            fontSize: '0.85em',
            color: '#767676',
            marginTop: '0.5rem',
            fontStyle: 'italic',
          }}
        >
          {props.description}
        </div>
      )}
    </FormFieldWrapper>
  );
};

SimpleArrayWidget.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func.isRequired,
  items: PropTypes.object,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(SimpleArrayWidget);
