import { registerAs } from '@nestjs/config';

export default registerAs('upload', () => ({
	provider: process.env.FILE_STORAGE_PROVIDER || 'local',
	localPath: process.env.UPLOAD_LOCAL_PATH || 'uploads',
	maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '5242880', 10),
	allowedMimeTypes: (process.env.UPLOAD_ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(
		',',
	),
	baseUrl: process.env.UPLOAD_BASE_URL || '',
}));
