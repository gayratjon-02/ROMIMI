// src/database/database.module.ts
import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Brand } from './entities/brand.entity';
import { Collection } from './entities/collection.entity';
import { Product } from './entities/product.entity';
import { Generation } from './entities/generation.entity';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const dbConfig = config.get<any>('database');
                const logger = new Logger('DatabaseModule');

                if (dbConfig?.url) {
                    const url = dbConfig.url as string;
                    const maskedUrl = url.replace(/:[^:@]+@/, ':****@');
                    logger.log(`Connecting to database via URL: ${maskedUrl}`);
                } else {
                    logger.warn('No database URL found in config.');
                }

                return {
                    ...dbConfig,
                    entities: [User, Brand, Collection, Product, Generation],
                    autoLoadEntities: false,
                    maxQueryExecutionTime: 10000,
                    extra: {
                        connectTimeoutMS: dbConfig?.connectTimeoutMS || 10000,
                    },
                };
            },
        }),

        TypeOrmModule.forFeature([User, Brand, Collection, Product, Generation]),
    ],
    exports: [TypeOrmModule],
})
export class DatabaseModule { }
