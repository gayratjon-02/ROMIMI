import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AIMessage } from '../libs/enums';

export type OpenAIImageResult = {
	mimeType: string;
	data?: string;
	url?: string;
	text?: string;
};

@Injectable()
export class OpenAIService {
	private client: OpenAI | null = null;
	private readonly logger = new Logger(OpenAIService.name);

	constructor(private readonly configService: ConfigService) {}

	async generateImage(
		prompt: string,
		aspectRatio?: string,
		resolution?: string,
	): Promise<OpenAIImageResult> {
		try {
			const client = this.getClient();

			this.logger.log(`Starting DALL-E 3 image generation for prompt: ${prompt.substring(0, 100)}...`);
			if (aspectRatio) {
				this.logger.log(`Aspect ratio: ${aspectRatio}`);
			}
			if (resolution) {
				this.logger.log(`Resolution: ${resolution}`);
			}

			// 🎨 Map aspect ratio to DALL-E 3 size format
			let size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024';
			if (aspectRatio === '9:16') {
				size = '1024x1792'; // Vertical/portrait
			} else if (aspectRatio === '4:5') {
				size = '1024x1792'; // Closest to 4:5
			} else if (aspectRatio === '1:1') {
				size = '1024x1024'; // Square
			}

			// 🎨 Sanitize prompt to avoid PII policy violations
			const sanitizedPrompt = this.sanitizePrompt(prompt);

			this.logger.log(`Calling DALL-E 3 API with size: ${size}`);
			this.logger.log(`Sanitized prompt: ${sanitizedPrompt.substring(0, 200)}...`);

			const response = await client.images.generate({
				model: 'dall-e-3',
				prompt: sanitizedPrompt,
				n: 1,
				size: size,
				quality: resolution === '4K' ? 'hd' : 'standard',
				response_format: 'b64_json', // Get base64 data directly
			});

			const imageData = response.data[0];

			if (imageData.b64_json) {
				this.logger.log(`✅ Successfully generated image via DALL-E 3, data length: ${imageData.b64_json.length}`);
				return {
					mimeType: 'image/png',
					data: imageData.b64_json,
				};
			}

			if (imageData.url) {
				this.logger.log(`✅ Successfully generated image via DALL-E 3, URL: ${imageData.url}`);
				// Download image from URL and convert to base64
				const imageBase64 = await this.downloadImageAsBase64(imageData.url);
				return {
					mimeType: 'image/png',
					data: imageBase64,
					url: imageData.url,
				};
			}

			throw new InternalServerErrorException('DALL-E 3 API did not return image data or URL');
		} catch (error: any) {
			const errorMessage = error?.message || String(error);
			this.logger.error(`DALL-E 3 generateImage failed: ${errorMessage}`);
			this.logger.error(`Error details:`, error);

			throw new InternalServerErrorException(AIMessage.GEMINI_API_ERROR);
		}
	}

	private sanitizePrompt(prompt: string): string {
		// Remove PII-related terms to avoid policy violations
		return prompt
			.replace(/\b(young|old|middle-aged)\s+(man|woman|person|model)\b/gi, 'professional model')
			.replace(/\b(confident|smiling|happy)\s+(young|old|middle-aged)?\s*(man|woman|person|model)\b/gi, 'professional model')
			.replace(/\bfather\s+and\s+son\b/gi, 'two professional models')
			.replace(/\bperson\b/gi, 'professional model')
			.replace(/\bpeople\b/gi, 'professional models')
			.replace(/\b(he|she|him|her)\b/gi, 'the model');
	}

	private async downloadImageAsBase64(url: string): Promise<string> {
		try {
			const response = await fetch(url);
			const arrayBuffer = await response.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			return buffer.toString('base64');
		} catch (error: any) {
			this.logger.error(`Failed to download image from URL: ${error.message}`);
			throw error;
		}
	}

	private getClient(): OpenAI {
		if (this.client) {
			return this.client;
		}

		const apiKey = this.configService.get<string>('OPENAI_API_KEY');

		if (!apiKey) {
			this.logger.error('OPENAI_API_KEY is missing in environment variables');
			throw new InternalServerErrorException(AIMessage.API_KEY_MISSING);
		}

		this.logger.log('OpenAI client initialized successfully');
		this.client = new OpenAI({ apiKey });
		return this.client;
	}
}
