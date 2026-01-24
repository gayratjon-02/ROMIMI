import { IsOptional, IsInt, Min, Max, IsString, IsArray, IsEnum } from 'class-validator';

export enum VariationStyle {
	SIMILAR = 'similar',
	CONTRASTING = 'contrasting',
	MODERN = 'modern',
	MINIMAL = 'minimal',
	BOLD = 'bold',
	ELEGANT = 'elegant',
}

export class GenerateVariationsDto {
	@IsOptional()
	@IsInt({ message: 'Variations count must be an integer' })
	@Min(1, { message: 'Minimum 1 variation required' })
	@Max(10, { message: 'Maximum 10 variations allowed' })
	variations_count?: number;

	@IsOptional()
	@IsArray({ message: 'Variation styles must be an array' })
	@IsEnum(VariationStyle, { each: true, message: 'Invalid variation style' })
	variation_styles?: VariationStyle[];

	@IsOptional()
	@IsString({ message: 'Custom instructions must be a string' })
	custom_instructions?: string;

	@IsOptional()
	@IsArray({ message: 'Avoid elements must be an array' })
	@IsString({ each: true, message: 'Each avoid element must be a string' })
	avoid_elements?: string[]; // Elements to avoid in variations

	@IsOptional()
	@IsArray({ message: 'Must include elements must be an array' })
	@IsString({ each: true, message: 'Each must include element must be a string' })
	must_include?: string[]; // Elements that must be included
}