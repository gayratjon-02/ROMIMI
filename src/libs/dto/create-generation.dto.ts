import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { GenerationType, ValidationMessage } from '../enums';

export class CreateGenerationDto {
	@IsUUID('4', { message: ValidationMessage.FIELD_INVALID })
	@IsNotEmpty({ message: ValidationMessage.FIELD_REQUIRED })
	product_id: string;

	@IsUUID('4', { message: ValidationMessage.FIELD_INVALID })
	@IsNotEmpty({ message: ValidationMessage.FIELD_REQUIRED })
	collection_id: string;

	@IsEnum(GenerationType, { message: ValidationMessage.FIELD_INVALID })
	@IsNotEmpty({ message: ValidationMessage.FIELD_REQUIRED })
	generation_type: GenerationType;

	@IsString({ message: ValidationMessage.FIELD_INVALID })
	@IsOptional()
	aspect_ratio?: string;

	@IsString({ message: ValidationMessage.FIELD_INVALID })
	@IsOptional()
	resolution?: string;
}
