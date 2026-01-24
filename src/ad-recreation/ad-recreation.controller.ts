import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { AdRecreationService } from './ad-recreation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { AdRecreation } from '../database/entities/ad-recreation.entity';
import {
	CreateAdRecreationDto,
	AnalyzeAdDto,
	GenerateVariationsDto,
} from '../libs/dto';

@Controller('ad-recreation')
@UseGuards(JwtAuthGuard)
export class AdRecreationController {
	constructor(private readonly adRecreationService: AdRecreationService) {}

	@Post()
	async createAdRecreation(
		@CurrentUser() user: User,
		@Body() dto: CreateAdRecreationDto,
	): Promise<AdRecreation> {
		return this.adRecreationService.create(user.id, dto);
	}

	@Get()
	async getAllAdRecreations(
		@CurrentUser() user: User,
		@Query('status') status?: string,
		@Query('page') page?: string,
		@Query('limit') limit?: string,
	): Promise<{
		items: AdRecreation[];
		total: number;
		page: number;
		limit: number;
	}> {
		return this.adRecreationService.findAll(user.id, {
			status,
			page: page ? parseInt(page, 10) : undefined,
			limit: limit ? parseInt(limit, 10) : undefined,
		});
	}

	@Get(':id')
	async getAdRecreation(
		@Param('id') id: string,
		@CurrentUser() user: User,
	): Promise<AdRecreation> {
		return this.adRecreationService.findOne(id, user.id);
	}

	@Post(':id/analyze')
	async analyzeAd(
		@Param('id') id: string,
		@CurrentUser() user: User,
		@Body() dto: AnalyzeAdDto,
	): Promise<AdRecreation> {
		return this.adRecreationService.analyzeAd(id, user.id, dto);
	}

	@Post(':id/generate')
	async generateVariations(
		@Param('id') id: string,
		@CurrentUser() user: User,
		@Body() dto: GenerateVariationsDto,
	): Promise<AdRecreation> {
		return this.adRecreationService.generateVariations(id, user.id, dto);
	}

	@Post('deleteAdRecreation/:id')
	async deleteAdRecreation(
		@Param('id') id: string,
		@CurrentUser() user: User,
	): Promise<{ message: string }> {
		return this.adRecreationService.remove(id, user.id);
	}
}