

// 🚀 Use Gemini 2.0 Flash Experimental for image generation
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

export type GeminiImageResult = {
	mimeType: string;
	data?: string;
	text?: string;
};