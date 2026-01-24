import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdRecreationController } from './ad-recreation.controller';
import { AdRecreationService } from './ad-recreation.service';
import { AdRecreation } from '../database/entities/ad-recreation.entity';
import { User } from '../database/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([AdRecreation, User])],
	controllers: [AdRecreationController],
	providers: [AdRecreationService],
	exports: [AdRecreationService],
})
export class AdRecreationModule {}