import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsImageFile, MaxFileSize } from '../../common/validators';

export class UploadFileDto {
	@ApiProperty({
		description: 'Image file to upload',
		type: 'string',
		format: 'binary',
	})
	@IsImageFile({ message: 'File must be a valid image (JPEG, PNG, GIF, WebP, or SVG)' })
	@MaxFileSize(5, { message: 'File size must not exceed 5MB' })
	file: any; // Using 'any' instead of Express.Multer.File to avoid namespace issues

	@IsOptional()
	@IsString({ message: 'Description must be a string' })
	description?: string;

	@IsOptional()
	@IsString({ message: 'Category must be a string' })
	category?: string;
}