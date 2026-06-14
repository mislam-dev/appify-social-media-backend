import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsEmailUniqueConstraint } from '../validators/is-email-unique.validator';

export function IsEmailUnique(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsEmailUniqueConstraint,
    });
  };
}
