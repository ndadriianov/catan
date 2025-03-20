import React from 'react';

type selectProps = {
  options: string[],
  initial: string,
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
      <option value={initial} disabled={true}>{initial}</option>
      {options.map(option =>
        <option value={option} key={option}>
          {option}
        </option>
      )}
    </select>
  );
};

export default Select;