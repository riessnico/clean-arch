import { FieldValidation } from '@/validation/protocols/field-validation';
import { RequiredFieldError } from '@/validation/errors/required-field-error';

export class RequiredFieldValidation implements FieldValidation {
  // eslint-disable-next-line no-useless-constructor
  constructor(readonly field: string) {}
  validate(value: string): Error {
    return new RequiredFieldError();
  }
}
