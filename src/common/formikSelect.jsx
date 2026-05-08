import React from 'react';
import Select from 'react-select';

const FormikSelect = ({
  name,
  options,
  value,
  placeholder = 'Select an option',
  onChange,
  onBlur,
}) => {
  return (
    <Select
       name={name}
      options={options}
      value={value} // 👈 Pass the full object, not just value
      onChange={(option) => onChange(name, option)} // 👈 Save the full object to Formik
      onBlur={() => onBlur(name, true)}
      placeholder={placeholder}
      isSearchable
      isClearable
      styles={{
        option: (provided) => ({
          ...provided,
          textAlign: 'left',
        }),
        singleValue: (provided) => ({
          ...provided,
          textAlign: 'left',
        }),
        placeholder: (provided) => ({
          ...provided,
          textAlign: 'left',
        }),
        input: (provided) => ({
          ...provided,
          textAlign: 'left',
        }),
      }}
    />
  );
};

export default FormikSelect;
