import { useState } from "react";

interface type {
  value: string;
  onChange: (event: { target: { value: string } }) => void;
}

const useInput = (initialValue: string): type => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (event: { target: { value: string } }) => {
    setValue(event.target.value);
  };

  return {
    value,
    onChange: handleChange,
  };
};

export default useInput;
