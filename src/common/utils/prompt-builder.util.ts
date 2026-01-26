export class PromptBuilder {
	static build(template: string, variables: Record<string, any>): string {
		let prompt = template;
		
		// Replace standard variables {{key}}
		Object.keys(variables).forEach(key => {
			const value = variables[key];
			// Handle primitives directly
			if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
				const regex = new RegExp(`{{${key}}}`, 'g');
				prompt = prompt.replace(regex, String(value));
			} 
			// Handle object/arrays by JSON stringifying (rare use case in prompts but good for debugging)
			else if (typeof value === 'object') {
				const regex = new RegExp(`{{${key}}}`, 'g');
				// For lists, join with commas if it's an array of strings
				if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
					prompt = prompt.replace(regex, value.join(', '));
				} else {
					prompt = prompt.replace(regex, JSON.stringify(value));
				}
			}
		});

		// Clean up any empty replacement markers
		// prompt = prompt.replace(/{{[^}]+}}/g, '');

		return prompt.trim();
	}

	static clean(prompt: string): string {
		// remove multiple spaces
		return prompt.replace(/\s+/g, ' ').trim();
	}
}
