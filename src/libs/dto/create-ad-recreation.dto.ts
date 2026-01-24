import { IsString, IsOptional, IsInt, Min, Max, IsArray, IsUrl } from 'class-validator';
import { ValidationMessage } from '../enums/common.enum';

export class CreateAdRecreationDto {
	@IsUrl({}, { message: 'Competitor ad URL must be a valid URL' })
	competitor_ad_url: string;

	@IsOptional()
	@IsString({ message: ValidationMessage.FIELD_INVALID })
	brand_brief?: string;

	@IsOptional()
	@IsArray({ message: 'Brand references must be an array' })
	brand_references?: string[]; // Array of URLs or file paths

	@IsOptional()
	@IsInt({ message: 'Variations count must be an integer' })
	@Min(1, { message: 'Minimum 1 variation required' })
	@Max(10, { message: 'Maximum 10 variations allowed' })
	variations_count?: number = 3;
}