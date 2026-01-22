import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const logger = new Logger('Bootstrap');

	try {
		const app = await NestFactory.create(AppModule, {
			logger: ['error', 'warn', 'log', 'debug', 'verbose'],
		});

		const configService = app.get(ConfigService);
		const port = configService.get<number>('app.port') || 3000;

		await app.listen(port);

		logger.log(`🚀 Application is running on: http://localhost:${port}`);
	} catch (error) {
		logger.error('❌ Failed to start application', error);
		process.exit(1);
	}
}

bootstrap();
