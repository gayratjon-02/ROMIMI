// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import databaseConfig from './config/database.config';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import uploadConfig from './config/upload.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BrandsModule } from './brands/brands.module';
import { CollectionsModule } from './collections/collections.module';
import { FilesModule } from './files/files.module';
import { ProductsModule } from './products/products.module';
import { AiModule } from './ai/ai.module';
import { GenerationsModule } from './generations/generations.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [databaseConfig, appConfig, jwtConfig, uploadConfig],
		}),

		// BullMQ Configuration
		BullModule.forRoot({
			redis: {
				host: process.env.REDIS_HOST || 'localhost',
				port: parseInt(process.env.REDIS_PORT || '6379', 10),
				password: process.env.REDIS_PASSWORD,
				db: parseInt(process.env.REDIS_DB || '0', 10),
			},
		}),

		DatabaseModule,
		AuthModule,
		UsersModule,
		BrandsModule,
		CollectionsModule,
		FilesModule,
		ProductsModule,
		AiModule,
		GenerationsModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
