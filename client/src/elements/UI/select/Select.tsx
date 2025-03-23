import React, {CSSProperties} from 'react';

type selectProps = {
  options: string[],
  initial: string,
  value: string,
  onChange: (value: string) => void,
  className?: string,
  style?: CSSProperties
}

const Select = ({options, initial, value, onChange, className, style}: selectProps) => {
  return (
    <select
      value={value}
      onChange={event => onChange(event.target.value)}
      className={className}
      style={style}
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