import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from '../libs/dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({
		summary: 'Register new user',
		description: 'Create a new user account with email, password, and optional name. Returns JWT token for immediate authentication.',
	})
	@ApiBody({
		type: RegisterDto,
		description: 'User registration data',
	})
	@ApiResponse({
		status: 201,
		description: 'User successfully registered',
		type: AuthResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Validation error (weak password, invalid email, etc.)',
		schema: {
			example: {
				statusCode: 400,
				message: ['Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'],
				error: 'Bad Request',
				timestamp: '2026-01-24T15:42:08.300Z',
				path: '/api/auth/register',
				method: 'POST',
			},
		},
	})
	@ApiResponse({
		status: 409,
		description: 'Email already exists',
		schema: {
			example: {
				statusCode: 409,
				message: 'User with this email already exists',
				error: 'Conflict',
			},
		},
	})
	@Public()
	@Post('register')
	@HttpCode(HttpStatus.CREATED)
	async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
		return this.authService.register(registerDto);
	}

	@ApiOperation({
		summary: 'Login user',
		description: 'Authenticate user with email and password. Returns JWT token for API access.',
	})
	@ApiBody({
		type: LoginDto,
		description: 'User login credentials',
	})
	@ApiResponse({
		status: 200,
		description: 'User successfully authenticated',
		type: AuthResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Validation error',
	})
	@ApiResponse({
		status: 401,
		description: 'Invalid credentials',
		schema: {
			example: {
				statusCode: 401,
				message: 'Invalid email or password',
				error: 'Unauthorized',
			},
		},
	})
	@Public()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
		return this.authService.login(loginDto);
	}
}
