import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, type Part, type EnhancedGenerateContentResponse } from '@google/generative-ai';
import { AIMessage } from '../libs/enums';
import { GEMINI_MODEL, GeminiImageResult } from 'src/libs/config';



@Injectable()
export class GeminiService {
	private client: GoogleGenerativeAI | null = null;
	private readonly logger = new Logger(GeminiService.name);

	private readonly defaultModel = GEMINI_MODEL;

	constructor(private readonly configService: ConfigService) { }

	async generateImage(
		prompt: string, 
		modelName?: string,
		aspectRatio?: string,
		resolution?: string
	): Promise<GeminiImageResult> {
		try {
			const model = this.getModel(modelName);

			this.logger.log(`Starting image generation for prompt: ${prompt.substring(0, 100)}...`);
			if (aspectRatio) {
				this.logger.log(`Aspect ratio: ${aspectRatio}`);
			}
			if (resolution) {
				this.logger.log(`Resolution: ${resolution}`);
			}

			// 🎨 Build enhanced prompt with EXPLICIT aspect ratio and resolution instructions
			let enhancedPrompt = `Create a photorealistic, high-quality commercial product image: ${prompt}`;

			// 📐 Exact dimension mapping for precise aspect ratio and resolution control
			let dimensions = '';
			if (aspectRatio && resolution) {
				const dimensionMap: Record<string, Record<string, string>> = {
					'4:5': {
						'2K': 'Image dimensions: 1638x2048 pixels (4:5 portrait ratio, 2K resolution)',
						'4K': 'Image dimensions: 3072x3840 pixels (4:5 portrait ratio, 4K resolution)',
					},
					'1:1': {
						'2K': 'Image dimensions: 2048x2048 pixels (1:1 square ratio, 2K resolution)',
						'4K': 'Image dimensions: 3840x3840 pixels (1:1 square ratio, 4K resolution)',
					},
					'9:16': {
						'2K': 'Image dimensions: 1152x2048 pixels (9:16 vertical ratio, 2K resolution)',
						'4K': 'Image dimensions: 2160x3840 pixels (9:16 vertical ratio, 4K resolution)',
					},
				};

				dimensions = dimensionMap[aspectRatio]?.[resolution] || `${aspectRatio} aspect ratio, ${resolution} resolution`;
			} else if (aspectRatio) {
				// Fallback if only aspect ratio is provided
				const aspectRatioMap: Record<string, string> = {
					'4:5': 'portrait orientation, 4:5 aspect ratio (vertical, taller than wide)',
					'1:1': 'square format, 1:1 aspect ratio (equal width and height)',
					'9:16': 'vertical/portrait format, 9:16 aspect ratio (very tall, mobile/Instagram story format)',
				};
				dimensions = aspectRatioMap[aspectRatio] || `aspect ratio ${aspectRatio}`;
			} else if (resolution) {
				// Fallback if only resolution is provided
				const resolutionMap: Record<string, string> = {
					'2K': '2K resolution (high quality)',
					'4K': '4K resolution (ultra high quality, maximum detail)',
				};
				dimensions = resolutionMap[resolution] || `Resolution: ${resolution}`;
			}

			if (dimensions) {
				enhancedPrompt = `${enhancedPrompt}\n\nIMPORTANT TECHNICAL SPECS:\n${dimensions}. Ultra high quality, professional photography, sharp details, perfect lighting.`;
			}

			// 🚀 CRITICAL: Use generateContentStream for better image generation support
			// Try to get image data from response
			const result = await model.generateContent({
				contents: [
					{
						role: 'user',
						parts: [
							{
								text: enhancedPrompt,
							},
						],
					},
				],
				generationConfig: {
					temperature: 0.7,
					topK: 40,
					topP: 0.95,
					maxOutputTokens: 8192, // Increased for image generation
				},
			});

			const response = result.response;

			// 🚀 CRITICAL: Check for inline image data FIRST
			const inlineData = this.extractInlineData(response);

			if (inlineData?.data) {
				this.logger.log(`✅ Successfully generated image (${inlineData.mimeType}), data length: ${inlineData.data.length}`);
				return {
					mimeType: inlineData.mimeType,
					data: inlineData.data,
				};
			}

			// 🚀 CRITICAL: If no image data, log error and throw exception
			const text = response.text();
			this.logger.error(`❌ Gemini API returned text instead of image!`);
			this.logger.error(`Response text: ${text.substring(0, 200)}...`);
			this.logger.error(`Response candidates:`, JSON.stringify(response.candidates, null, 2));
			
			// Throw error instead of returning text
			throw new InternalServerErrorException(
				`Gemini API did not generate an image. Response: ${text.substring(0, 100)}`
			);
		} catch (error: any) {
			const errorMessage = error?.response?.error ? JSON.stringify(error.response.error) : error?.message || String(error);
			this.logger.error(`Gemini generateImage failed: ${errorMessage}`);

			throw new InternalServerErrorException(AIMessage.GEMINI_API_ERROR);
		}
	}

	async generateBatch(prompts: string[], modelName?: string): Promise<GeminiImageResult[]> {
		const results: GeminiImageResult[] = [];

		for (const prompt of prompts) {
			const result = await this.generateImage(prompt, modelName);
			results.push(result);
		}

		return results;
	}

	private getModel(modelName?: string) {
		const client = this.getClient();

		return client.getGenerativeModel({
			model: modelName || this.defaultModel,
		});
	}

	private getClient(): GoogleGenerativeAI {
		if (this.client) {
			return this.client;
		}

		const apiKey = this.configService.get<string>('gemini.apiKey');

		if (!apiKey) {
			this.logger.error('GEMINI_API_KEY is missing in environment variables');
			throw new InternalServerErrorException(AIMessage.API_KEY_MISSING);
		}

		this.logger.log('Gemini client initialized successfully');
		this.client = new GoogleGenerativeAI(apiKey);
		return this.client;
	}

	private extractInlineData(response: EnhancedGenerateContentResponse): { mimeType: string; data: string } | null {
		const parts: Part[] = response.candidates?.[0]?.content?.parts || [];

		this.logger.log(`🔍 Extracting inline data from ${parts.length} parts`);

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			this.logger.log(`🔍 Part ${i} type:`, (part as any).inlineData ? 'inlineData' : 'text');
			
			const inlineData = (part as { inlineData?: { mimeType: string; data: string } }).inlineData;

			if (inlineData?.data) {
				this.logger.log(`✅ Found inline data: mimeType=${inlineData.mimeType}, dataLength=${inlineData.data.length}`);
				return inlineData;
			}
		}

		this.logger.warn(`⚠️ No inline data found in response parts`);
		return null;
	}
}
