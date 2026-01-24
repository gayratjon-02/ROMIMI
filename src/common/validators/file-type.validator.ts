import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ name: 'isImageFile', async: false })
export class ImageFileValidator implements ValidatorConstraintInterface {
	validate(value: any, args: ValidationArguments) {
		if (!value) return true; // Allow null/undefined for optional fields

		// For Express.Multer.File
		if (value.mimetype) {
			return this.isValidImageMimeType(value.mimetype);
		}

		// For base64 strings
		if (typeof value === 'string' && value.startsWith('data:image/')) {
			return true;
		}

		// For file extensions
		if (typeof value === 'string') {
			return this.isValidImageExtension(value);
		}

		return false;
	}

	private isValidImageMimeType(mimeType: string): boolean {
		const validMimeTypes = [
			'image/jpeg',
			'image/jpg', 
			'image/png',
			'image/gif',
			'image/webp',
			'image/svg+xml'
		];
		return validMimeTypes.includes(mimeType.toLowerCase());
	}

	private isValidImageExtension(filename: string): boolean {
		const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
		const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
		return validExtensions.includes(extension);
	}

	defaultMessage(args: ValidationArguments) {
		return 'File must be a valid image (JPEG, PNG, GIF, WebP, or SVG)';
	}
}

@ValidatorConstraint({ name: 'maxFileSize', async: false })
export class MaxFileSizeValidator implements ValidatorConstraintInterface {
	validate(value: any, args: ValidationArguments) {
		if (!value) return true; // Allow null/undefined for optional fields

		const maxSizeInMB = args.constraints[0] || 5; // Default 5MB
		const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

		// For Express.Multer.File
		if (value.size) {
			return value.size <= maxSizeInBytes;
		}

		// For base64 strings (approximate size calculation)
		if (typeof value === 'string' && value.includes('base64,')) {
			const base64Data = value.split('base64,')[1];
			const approximateSize = (base64Data.length * 3) / 4;
			return approximateSize <= maxSizeInBytes;
		}

		return true;
	}

	defaultMessage(args: ValidationArguments) {
		const maxSizeInMB = args.constraints[0] || 5;
		return `File size must not exceed ${maxSizeInMB}MB`;
	}
}

export function IsImageFile(validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: ImageFileValidator,
		});
	};
}

export function MaxFileSize(maxSizeInMB: number, validationOptions?: ValidationOptions) {
	return function (object: Object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [maxSizeInMB],
			validator: MaxFileSizeValidator,
		});
	};
}