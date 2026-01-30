import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateUserDto } from '../libs/dto';
import { User } from '../database/entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('getUser')
	async getUser(@CurrentUser() user: User): Promise<Omit<User, 'password_hash'>> {
		return this.usersService.findOne(user.id);
	}

	@Get('getSettings')
	async getSettings(@CurrentUser() user: User): Promise<Partial<User>> {
		return this.usersService.getSettings(user.id);
	}

	@Post('updateUser')
	async updateUser(
		@CurrentUser() user: User,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<Omit<User, 'password_hash'>> {
		return this.usersService.update(user.id, updateUserDto);
	}

	@Post('updateSettings')
	async updateSettings(
		@CurrentUser() user: User,
		@Body() updateUserDto: UpdateUserDto,
	): Promise<Omit<User, 'password_hash'>> {
		return this.usersService.update(user.id, updateUserDto);
	}

	@Post('updateApiKey')
	async updateApiKey(
		@CurrentUser() user: User,
		@Body() body: { keyType: 'openai' | 'anthropic' | 'gemini'; apiKey: string | null },
	): Promise<{ success: boolean; message: string }> {
		return this.usersService.updateApiKey(user.id, body.keyType, body.apiKey);
	}
}
