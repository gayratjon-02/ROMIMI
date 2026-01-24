import { IsEmail, IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ValidationMessage } from '../enums';
import { IsBusinessEmail, IsPasswordStrong } from '../../common/validators';

export class RegisterDto {
	@IsEmail({}, { message: ValidationMessage.EMAIL_INVALID })
	@IsBusinessEmail({ message: 'Please provide a valid business email address' })
	@IsNotEmpty({ message: ValidationMessage.FIELD_REQUIRED })
	email: string;

	@IsString({ message: ValidationMessage.FIELD_INVALID })
	@IsPasswordStrong()
	@IsNotEmpty({ message: ValidationMessage.FIELD_REQUIRED })
	password: string;

	@IsString()
	@IsOptional()
	name?: string;
}
