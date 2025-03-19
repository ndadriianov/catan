import React from 'react';

type selectProps = {
  options: {value: string, label: string}[],
  initial: {value: string, label: string},
  value: string,
  onChange: (value: string) => void,
  className: any
}

const Select = ({options, initial, value, onChange, className}: selectProps) => {
  return (
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      className={className}
    >
      <option value={initial.value} disabled={true}>{initial.label}</option>
      {options.map(option =>
        <option value={option.value} key={option.value}>
          {option.label}
        </option>
      )}
    </select>
  );
};

export default Select;