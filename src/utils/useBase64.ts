import { useState, useEffect } from "react";

const useBase64 = (file: File | null) => {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isError, setError] = useState<boolean>(false);

  useEffect(() => {
    const reader = new FileReader();

    reader.onloadstart = () => {
      setLoading(true);
    };

    reader.onload = () => {
      if (reader.result !== null && reader.readyState === FileReader.DONE) {
        setLoading(false);
        setResult(reader.result as string);
      }
    };

    reader.onerror = () => {
      setLoading(false);
      setError(true);
    };

    if (file) reader.readAsDataURL(file);
  }, [file]);

  return { result, isLoading, isError };
};

export default useBase64;
