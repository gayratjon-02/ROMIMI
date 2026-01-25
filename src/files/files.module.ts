import { Module, BadRequestException } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { S3Service } from './s3.service';
import { FileMessage } from '../libs/enums';

@Module({
	imports: [
		ConfigModule,
		MulterModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const uploadConfig = configService.get<any>('upload');
				const localPath = uploadConfig.localPath as string;
				const absolutePath = path.join(process.cwd(), localPath);

				fs.mkdirSync(absolutePath, { recursive: true });

				return {
					storage: diskStorage({
						destination: absolutePath,
						filename: (req, file, cb) => {
							const ext = path.extname(file.originalname);
							cb(null, `${randomUUID()}${ext}`);
						},
					}),
					limits: { fileSize: uploadConfig.maxFileSize },
					fileFilter: (req, file, cb) => {
						const allowed = uploadConfig.allowedMimeTypes || [];
						if (!allowed.includes(file.mimetype)) {
							return cb(
								new BadRequestException(FileMessage.INVALID_FILE_TYPE),
								false,
							);
						}
						return cb(null, true);
					},
				};
			},
		}),
	],
	controllers: [FilesController],
	providers: [FilesService, S3Service],
	exports: [FilesService, S3Service, MulterModule],
})
export class FilesModule {}
