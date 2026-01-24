import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
	ApiParam,
	ApiQuery,
	ApiBody,
} from '@nestjs/swagger';
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

@ApiTags('Ad Recreation')
@ApiBearerAuth('JWT-auth')
@Controller('ad-recreation')
@UseGuards(JwtAuthGuard)
export class AdRecreationController {
	constructor(private readonly adRecreationService: AdRecreationService) {}

	@ApiOperation({
		summary: 'Create ad recreation project',
		description: 'Upload a competitor ad image URL and create a new ad recreation project for analysis and variation generation.',
	})
	@ApiBody({
		type: CreateAdRecreationDto,
		description: 'Ad recreation project data',
	})
	@ApiResponse({
		status: 201,
		description: 'Ad recreation project created successfully',
		schema: {
			example: {
				id: '123e4567-e89b-12d3-a456-426614174000',
				competitor_ad_url: 'https://example.com/competitor-ad.jpg',
				brand_brief: 'Premium streetwear brand...',
				variations_count: 3,
				status: 'uploaded',
				created_at: '2026-01-24T15:42:08.300Z',
				user_id: 'user-uuid',
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Validation error',
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized - JWT token required',
	})
	@Post()
	async createAdRecreation(
		@CurrentUser() user: User,
		@Body() dto: CreateAdRecreationDto,
	): Promise<AdRecreation> {
		return this.adRecreationService.create(user.id, dto);
	}

	@ApiOperation({
		summary: 'Get all ad recreation projects',
		description: 'Retrieve all ad recreation projects for the authenticated user with optional filtering.',
	})
	@ApiQuery({
		name: 'status',
		description: 'Filter by status',
		enum: ['uploaded', 'analyzing', 'analyzed', 'generating', 'completed', 'failed'],
		required: false,
	})
	@ApiQuery({
		name: 'page',
		description: 'Page number (default: 1)',
		example: 1,
		required: false,
	})
	@ApiQuery({
		name: 'limit',
		description: 'Items per page (default: 10)',
		example: 10,
		required: false,
	})
	@ApiResponse({
		status: 200,
		description: 'List of ad recreation projects',
		schema: {
			example: {
				items: [
					{
						id: '123e4567-e89b-12d3-a456-426614174000',
						competitor_ad_url: 'https://example.com/competitor-ad.jpg',
						status: 'completed',
						created_at: '2026-01-24T15:42:08.300Z',
					},
				],
				total: 1,
				page: 1,
				limit: 10,
			},
		},
	})
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

	@ApiOperation({
		summary: 'Analyze competitor ad',
		description: 'Analyze the competitor ad using Claude AI to extract visual elements, messaging, and composition insights.',
	})
	@ApiParam({
		name: 'id',
		description: 'Ad recreation project ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ApiBody({
		type: AnalyzeAdDto,
		description: 'Analysis configuration and context',
	})
	@ApiResponse({
		status: 200,
		description: 'Ad analysis completed successfully',
		schema: {
			example: {
				id: '123e4567-e89b-12d3-a456-426614174000',
				status: 'analyzed',
				analysis_result: {
					visual_elements: {
						color_scheme: ['#FF6B35', '#004E64', '#FFFFFF'],
						typography: 'Modern sans-serif, bold headers',
						layout: 'Center-aligned with hero image',
					},
					messaging: {
						headline: 'Discover Your Style',
						tone: 'Confident and aspirational',
					},
					recommendations: [
						'Use similar color palette but adapt to brand colors',
						'Maintain clean, modern typography approach',
					],
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Ad recreation not in uploadable status or validation error',
	})
	@ApiResponse({
		status: 404,
		description: 'Ad recreation not found',
	})
	@Post(':id/analyze')
	async analyzeAd(
		@Param('id') id: string,
		@CurrentUser() user: User,
		@Body() dto: AnalyzeAdDto,
	): Promise<AdRecreation> {
		return this.adRecreationService.analyzeAd(id, user.id, dto);
	}

	@ApiOperation({
		summary: 'Generate ad variations',
		description: 'Generate multiple ad variations using Gemini AI based on the analysis results and your specifications.',
	})
	@ApiParam({
		name: 'id',
		description: 'Ad recreation project ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ApiBody({
		type: GenerateVariationsDto,
		description: 'Variation generation settings',
	})
	@ApiResponse({
		status: 200,
		description: 'Ad variations generated successfully',
		schema: {
			example: {
				id: '123e4567-e89b-12d3-a456-426614174000',
				status: 'completed',
				generated_variations: {
					variations: [
						{
							variation_id: 'variation_1',
							style: 'similar',
							image_url: 'https://example.com/generated_variation_1.png',
							prompt_used: 'Create a similar style advertisement...',
						},
					],
					generation_metadata: {
						total_variations: 3,
						generation_time: '3.2s',
						model_used: 'gemini-2.5-flash-image',
					},
				},
			},
		},
	})
	@ApiResponse({
		status: 400,
		description: 'Ad recreation must be analyzed before generating variations',
	})
	@ApiResponse({
		status: 404,
		description: 'Ad recreation not found',
	})
	@Post(':id/generate')
	async generateVariations(
		@Param('id') id: string,
		@CurrentUser() user: User,
		@Body() dto: GenerateVariationsDto,
	): Promise<AdRecreation> {
		return this.adRecreationService.generateVariations(id, user.id, dto);
	}

	@ApiOperation({
		summary: 'Delete ad recreation project',
		description: 'Permanently delete an ad recreation project and all associated data.',
	})
	@ApiParam({
		name: 'id',
		description: 'Ad recreation project ID',
		example: '123e4567-e89b-12d3-a456-426614174000',
	})
	@ApiResponse({
		status: 200,
		description: 'Ad recreation project deleted successfully',
		schema: {
			example: {
				message: 'Ad recreation deleted successfully',
			},
		},
	})
	@ApiResponse({
		status: 404,
		description: 'Ad recreation not found',
	})
	@Post('deleteAdRecreation/:id')
	async deleteAdRecreation(
		@Param('id') id: string,
		@CurrentUser() user: User,
	): Promise<{ message: string }> {
		return this.adRecreationService.remove(id, user.id);
	}
}