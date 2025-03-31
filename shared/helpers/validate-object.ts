import type { TErrors } from "..";
import type { ZodObject } from "zod";

const validateObject = (
  data: unknown,
  ZedObject: ZodObject<any>
): TErrors | undefined => {
  const result = ZedObject.partial().safeParse(data);

  if (result.success) {
    return undefined;
  }

  const errors: TErrors = {};

  for (const key in result.error.format()) {
    if (key !== "_errors") {
      const fieldErrors = result.error.format()[key]?._errors;

      if (fieldErrors && fieldErrors.length > 0) {
        errors[key] = fieldErrors.join(", ");
      }
    }
  }

  return errors;
};

export { validateObject };
