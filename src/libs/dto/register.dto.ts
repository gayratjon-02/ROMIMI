import { IsEmail, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationMessage } from '../enums';
import { IsBusinessEmail, IsPasswordStrong } from '../../common/validators';

export class RegisterDto {
	@ApiProperty({
		description: 'User email address (business emails only, no disposable emails)',
		example: 'john.doe@company.com',
		format: 'email',
	})
	@IsEmail({}, { message: ValidationMessage.EMAIL_INVALID })
	@IsBusinessEmail({ message: 'Please provide a valid business email address' })
	@IsNotEmpty({ message: ValidationMessage.FIELD_REQUIRED })
	email: string;

	@ApiProperty({
		description: 'Strong password (min 8 chars, uppercase, lowercase, number)',
		example: 'MySecurePass123',
		minLength: 8,
	})
	@IsString({ message: ValidationMessage.FIELD_INVALID })
	@IsPasswordStrong()
	@IsNotEmpty({ message: ValidationMessage.FIELD_REQUIRED })
	password: string;

	@ApiProperty({
		description: 'User full name (optional)',
		example: 'John Doe',
		required: false,
	})
	@IsString()
	@IsOptional()
	name?: string;
}
