export interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate(toValidate: Validatable): boolean {
  let isValid = true;
  if (toValidate.required) {
    isValid = isValid && toValidate.value.toString().trim().length !== 0;
  }
  if (toValidate.minLength != null && typeof toValidate.value === "string") {
    isValid =
      isValid &&
      toValidate.value.toString().trim().length >= toValidate.minLength;
  }
  if (toValidate.maxLength != null && typeof toValidate.value === "string") {
    isValid =
      isValid &&
      toValidate.value.toString().trim().length <= toValidate.maxLength;
  }
  if (toValidate.min != null && typeof toValidate.value === "number") {
    isValid = isValid && toValidate.value >= toValidate.min;
  }
  if (toValidate.max != null && typeof toValidate.value === "number") {
    isValid = isValid && toValidate.value <= toValidate.max;
  }
  return isValid;
}
