import { ApiProperty } from '@nestjs/swagger';

class UserInfo {
	@ApiProperty({
		description: 'User unique identifier',
		example: '123e4567-e89b-12d3-a456-426614174000',
		format: 'uuid',
	})
	id: string;

	@ApiProperty({
		description: 'User email address',
		example: 'john.doe@company.com',
		format: 'email',
	})
	email: string;

	@ApiProperty({
		description: 'User full name',
		example: 'John Doe',
		nullable: true,
	})
	name: string | null;
}

export class AuthResponseDto {
	@ApiProperty({
		description: 'JWT access token for authentication',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	access_token: string;

	@ApiProperty({
		description: 'User information',
		type: UserInfo,
	})
	user: UserInfo;
}
