import { useEffect } from 'react';

const useInitialValues = (
  values: any,
  mutator: React.Dispatch<React.SetStateAction<any>>
) => {
  useEffect(() => {
    if (!values) return;

    mutator((prev) => ({ ...prev, ...values }));
  }, [values, mutator]);
};

export { useInitialValues };
