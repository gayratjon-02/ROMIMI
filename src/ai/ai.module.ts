import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClaudeService } from './claude.service';
import { GeminiService } from './gemini.service';
import { OpenAIService } from './openai.service';

@Module({
	imports: [ConfigModule],
	providers: [ClaudeService, GeminiService, OpenAIService],
	exports: [ClaudeService, GeminiService, OpenAIService],
})
export class AiModule {}
