import { TGenericObject } from '@perseusfs/shared';
import { useCallback, useEffect, useMemo, useState } from 'react';

const useForm = (initialValues?: TGenericObject) => {
  const [values, setValues] = useState<TGenericObject>({});
  const [errors, setErrors] = useState<TGenericObject>({});

  const onFieldChange = useCallback(
    (name: string, value: string | number | boolean) => {
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    [setValues]
  );

  const r = useCallback(
    (name: string, asNumber: boolean = false) => {
      return {
        name,
        value: asNumber ? Number(values[name]) || 0 : (values[name] ?? ''),
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          const val = asNumber
            ? parseFloat(e.target.value) || 0
            : e.target.value;
          setValues((prev) => ({ ...prev, [name]: val }));
        }
      };
    },
    [values, setValues]
  );

  // register select
  const rs = useCallback(
    (name: string, asNumber: boolean = false) => {
      return {
        name,
        value: asNumber ? Number(values[name]) || 0 : (values[name] ?? ''),
        onValueChange: (value: string | null) => {
          if (value === null) {
            setValues((prev) => ({ ...prev, [name]: value }));
            return;
          }

          const val = asNumber ? parseFloat(value) || 0 : value;

          setValues((prev) => ({ ...prev, [name]: val }));
        }
      };
    },
    [values]
  );

  useEffect(() => {
    if (!initialValues) return;

    setValues(initialValues);
  }, [initialValues]);

  const formValue = useMemo(
    () => ({
      values,
      errors,
      r,
      setErrors,
      rs,
      onFieldChange
    }),
    [values, errors, r, setErrors, rs, onFieldChange]
  );

  return formValue;
};

export { useForm };
