import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ name: 'passwordStrength', async: false })
export class PasswordStrengthValidator implements ValidatorConstraintInterface {
	validate(password: string, args: ValidationArguments) {
		if (!password) return false;

		// At least 8 characters
		if (password.length < 8) return false;

		// At least one uppercase letter
		if (!/[A-Z]/.test(password)) return false;

		// At least one lowercase letter  
		if (!/[a-z]/.test(password)) return false;

		// At least one number
		if (!/\d/.test(password)) return false;

		return true;
	}

	defaultMessage(args: ValidationArguments) {
		return 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number';
	}
}

export function IsPasswordStrong(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: PasswordStrengthValidator,
		});
	};
}