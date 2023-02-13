import type { ChangeEvent, SetStateAction } from "react";
import { useState } from "react";

export interface useInputType<T> {
  value: T;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const useInput = <T>(initialValue: T): useInputType<T> => {
  const [value, setValue] = useState<T>(initialValue);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value as SetStateAction<T>);
  };

  return {
    value,
    onChange,
  };
};

export default useInput;
