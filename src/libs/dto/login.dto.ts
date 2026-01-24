import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationMessage } from '../enums';

export class LoginDto {
	@ApiProperty({
		description: 'Registered email address',
		example: 'john.doe@company.com',
		format: 'email',
	})
	@IsEmail({}, { message: ValidationMessage.EMAIL_INVALID })
	@IsNotEmpty({ message: ValidationMessage.FIELD_REQUIRED })
	email: string;

	@ApiProperty({
		description: 'User password',
		example: 'MySecurePass123',
		format: 'password',
	})
	@IsString({ message: ValidationMessage.FIELD_INVALID })
	@IsNotEmpty({ message: ValidationMessage.FIELD_REQUIRED })
	password: string;
}
