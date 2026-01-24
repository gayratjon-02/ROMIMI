import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ name: 'isBusinessEmail', async: false })
export class BusinessEmailValidator implements ValidatorConstraintInterface {
	validate(email: string, args: ValidationArguments) {
		if (!email) return false;

		// Basic email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) return false;

		// Block common disposable email providers
		const disposableDomains = [
			'10minutemail.com',
			'guerrillamail.com',
			'mailinator.com',
			'tempmail.org',
			'yopmail.com',
			'temp-mail.org',
			'throwaway.email'
		];

		const domain = email.split('@')[1]?.toLowerCase();
		if (disposableDomains.includes(domain)) return false;

		return true;
	}

	defaultMessage(args: ValidationArguments) {
		return 'Please provide a valid business email address';
	}
}

@ValidatorConstraint({ name: 'emailExists', async: true })
export class EmailExistsValidator implements ValidatorConstraintInterface {
	async validate(email: string, args: ValidationArguments) {
		// This would typically check database for existing email
		// For now, we'll just return true (implement in service layer)
		return true;
	}

	defaultMessage(args: ValidationArguments) {
		return 'Email address is already registered';
	}
}

export function IsBusinessEmail(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: BusinessEmailValidator,
		});
	};
}

export function EmailExists(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: EmailExistsValidator,
		});
	};
}