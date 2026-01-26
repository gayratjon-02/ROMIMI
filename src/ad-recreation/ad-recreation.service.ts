import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdRecreation, AdRecreationStatus } from '../database/entities/ad-recreation.entity';
import { User } from '../database/entities/user.entity';
import {
	CreateAdRecreationDto,
	AnalyzeAdDto,
	GenerateVariationsDto,
} from '../libs/dto';
import { AIMessage, ErrorMessage, NotFoundMessage } from '../libs/enums';

type AdRecreationFilters = {
	status?: string;
	page?: number;
	limit?: number;
};

@Injectable()
export class AdRecreationService {
	private readonly logger = new Logger(AdRecreationService.name);

	constructor(
		@InjectRepository(AdRecreation)
		private readonly adRecreationRepository: Repository<AdRecreation>,
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>,
	) {}

	async create(userId: string, dto: CreateAdRecreationDto): Promise<AdRecreation> {
		this.logger.log(`Creating ad recreation for user: ${userId}`);

		const user = await this.usersRepository.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException(NotFoundMessage.USER_NOT_FOUND);
		}

		const adRecreation = this.adRecreationRepository.create({
			competitor_ad_url: dto.competitor_ad_url,
			brand_brief: dto.brand_brief,
			brand_reference_images: dto.brand_references,
			variations_count: dto.variations_count || 3,
			status: AdRecreationStatus.UPLOADED as string,
			user_id: userId,
		});

		const savedAdRecreation = await this.adRecreationRepository.save(adRecreation);
		this.logger.log(`Ad recreation created with ID: ${savedAdRecreation.id}`);

		return savedAdRecreation;
	}

	async findAll(userId: string, filters: AdRecreationFilters = {}): Promise<{
		items: AdRecreation[];
		total: number;
		page: number;
		limit: number;
	}> {
		const { status, page = 1, limit = 10 } = filters;

		const queryBuilder = this.adRecreationRepository
			.createQueryBuilder('adRecreation')
			.where('adRecreation.user_id = :userId', { userId })
			.orderBy('adRecreation.created_at', 'DESC');

		if (status) {
			queryBuilder.andWhere('adRecreation.status = :status', { status });
		}

		const total = await queryBuilder.getCount();
		const items = await queryBuilder
			.skip((page - 1) * limit)
			.take(limit)
			.getMany();

		return { items, total, page, limit };
	}

	async findOne(id: string, userId: string): Promise<AdRecreation> {
		const adRecreation = await this.adRecreationRepository.findOne({
			where: { id, user_id: userId },
		});

		if (!adRecreation) {
			throw new NotFoundException('Ad recreation not found');
		}

		return adRecreation;
	}

	async analyzeAd(
		id: string,
		userId: string,
		dto: AnalyzeAdDto,
	): Promise<AdRecreation> {
		this.logger.log(`Starting analysis for ad recreation: ${id}`);

		const adRecreation = await this.findOne(id, userId);

		if (adRecreation.status !== AdRecreationStatus.UPLOADED) {
			throw new BadRequestException(
				'Ad recreation must be in uploaded status for analysis',
			);
		}

		// Update status to analyzing
		adRecreation.status = AdRecreationStatus.ANALYZING;
		await this.adRecreationRepository.save(adRecreation);

		try {
			// TODO: Implement Claude AI analysis
			// For now, we'll simulate analysis with mock data
			const analysisResult = await this.performClaudeAnalysis(
				adRecreation.competitor_ad_url,
				adRecreation.brand_brief,
				dto,
			);

			adRecreation.competitor_analysis = analysisResult;
			adRecreation.status = AdRecreationStatus.ANALYZED;
			await this.adRecreationRepository.save(adRecreation);

			this.logger.log(`Analysis completed for ad recreation: ${id}`);
			return adRecreation;
		} catch (error) {
			this.logger.error(`Analysis failed for ad recreation ${id}:`, error.message);
			adRecreation.status = AdRecreationStatus.FAILED;
			adRecreation.error_message = error.message;
			await this.adRecreationRepository.save(adRecreation);
			throw new InternalServerErrorException(AIMessage.CLAUDE_API_ERROR);
		}
	}

	async generateVariations(
		id: string,
		userId: string,
		dto: GenerateVariationsDto,
	): Promise<AdRecreation> {
		this.logger.log(`Starting variation generation for ad recreation: ${id}`);

		const adRecreation = await this.findOne(id, userId);

		if (adRecreation.status !== AdRecreationStatus.ANALYZED) {
			throw new BadRequestException(
				'Ad recreation must be analyzed before generating variations',
			);
		}

		// Update status to generating
		adRecreation.status = AdRecreationStatus.GENERATING;
		if (dto.variations_count) {
			adRecreation.variations_count = dto.variations_count;
		}
		await this.adRecreationRepository.save(adRecreation);

		try {
			// TODO: Implement Gemini image generation
			// For now, we'll simulate generation with mock data
			const generatedVariations = await this.performImageGeneration(
				adRecreation.competitor_analysis,
				adRecreation.variations_count,
				dto,
			);

			adRecreation.generated_variations = generatedVariations;
			adRecreation.status = AdRecreationStatus.COMPLETED;
			adRecreation.completed_at = new Date();
			await this.adRecreationRepository.save(adRecreation);

			this.logger.log(`Variations generated for ad recreation: ${id}`);
			return adRecreation;
		} catch (error) {
			this.logger.error(
				`Variation generation failed for ad recreation ${id}:`,
				error.message,
			);
			adRecreation.status = AdRecreationStatus.FAILED;
			adRecreation.error_message = error.message;
			await this.adRecreationRepository.save(adRecreation);
			throw new InternalServerErrorException(AIMessage.GEMINI_API_ERROR);
		}
	}

	async remove(id: string, userId: string): Promise<{ message: string }> {
		const adRecreation = await this.findOne(id, userId);
		await this.adRecreationRepository.remove(adRecreation);
		return { message: 'Ad recreation deleted successfully' };
	}

	// Private methods for AI integration (to be implemented)
	private async performClaudeAnalysis(
		competitorAdUrl: string,
		brandBrief: string,
		dto: AnalyzeAdDto,
	): Promise<any> {
		// Mock analysis result
		// TODO: Replace with actual Claude AI integration
		await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

		return {
			visual_elements: {
				color_scheme: ['#FF6B35', '#004E64', '#FFFFFF'],
				typography: 'Modern sans-serif, bold headers',
				layout: 'Center-aligned with hero image',
				imagery_style: 'Lifestyle photography with natural lighting',
			},
			messaging: {
				headline: 'Discover Your Style',
				call_to_action: 'Shop Now',
				tone: 'Confident and aspirational',
				target_emotion: 'Desire and excitement',
			},
			composition: {
				focal_point: 'Product prominently displayed',
				visual_hierarchy: 'Title -> Product -> CTA',
				white_space_usage: 'Generous padding around elements',
			},
			brand_analysis: {
				positioning: 'Premium lifestyle brand',
				values: ['Quality', 'Style', 'Innovation'],
				target_audience: 'Young professionals, 25-35 years',
			},
			recommendations: [
				'Use similar color palette but adapt to brand colors',
				'Maintain clean, modern typography approach',
				'Focus on lifestyle imagery over product shots',
				'Emphasize aspirational messaging',
			],
			analyzed_at: new Date().toISOString(),
		};
	}

	private async performImageGeneration(
		analysisResult: any,
		variationsCount: number,
		dto: GenerateVariationsDto,
	): Promise<any> {
		// Mock generation result
		// TODO: Replace with actual Gemini AI integration
		await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate generation time

		const variations = [];
		for (let i = 0; i < variationsCount; i++) {
			variations.push({
				variation_id: `variation_${i + 1}`,
				style: dto.variation_styles?.[i] || 'similar',
				image_url: `https://example.com/generated_variation_${i + 1}.png`,
				prompt_used: `Create a ${dto.variation_styles?.[i] || 'similar'} style advertisement based on analysis`,
				generated_at: new Date().toISOString(),
				metadata: {
					resolution: '1024x1024',
					format: 'PNG',
					size: Math.floor(Math.random() * 2000000) + 500000, // Random size between 500KB-2.5MB
				},
			});
		}

		return {
			variations,
			generation_metadata: {
				total_variations: variationsCount,
				generation_time: '3.2s',
				model_used: 'gemini-2.5-flash-image',
				custom_instructions: dto.custom_instructions,
				avoided_elements: dto.avoid_elements,
				included_elements: dto.must_include,
			},
		};
	}
}