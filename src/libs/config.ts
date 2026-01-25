
// 🚀 Use Imagen 4.0 Fast for real image generation via Gemini API
// Imagen 4.0 Fast is Google's latest image generation model
// It's faster and more efficient than previous versions
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'imagen-4.0-fast-generate-001';

export type GeminiImageResult = {
	mimeType: string;
	data?: string;
	text?: string;
};