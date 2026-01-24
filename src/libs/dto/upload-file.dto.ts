import { IsOptional, IsString } from 'class-validator';
import { IsImageFile, MaxFileSize } from '../../common/validators';

export class UploadFileDto {
	@IsImageFile({ message: 'File must be a valid image (JPEG, PNG, GIF, WebP, or SVG)' })
	@MaxFileSize(5, { message: 'File size must not exceed 5MB' })
	file: Express.Multer.File;

	@IsOptional()
	@IsString({ message: 'Description must be a string' })
	description?: string;

	@IsOptional()
	@IsString({ message: 'Category must be a string' })
	category?: string;
}