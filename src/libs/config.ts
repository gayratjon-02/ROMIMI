
// 🚀 Use Gemini 2.0 Flash Experimental for image generation
// Note: Gemini models don't directly generate images - they analyze images
// For image generation, you need Imagen API or another image generation service
// This model is used for text-to-image prompts, but may not return images
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

export type GeminiImageResult = {
	mimeType: string;
	data?: string;
	text?: string;
};