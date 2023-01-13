import { useState } from "react";

const useInput = (initialValue: string) => {
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
