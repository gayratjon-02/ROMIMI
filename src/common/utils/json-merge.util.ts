export function mergeDeep(target: any, source: any): any {
	const isObject = (obj: any) => obj && typeof obj === 'object';

	if (!isObject(target) || !isObject(source)) {
		return source;
	}

	Object.keys(source).forEach((key) => {
		const targetValue = target[key];
		const sourceValue = source[key];

		if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
			// For arrays, we use the source array (replacement strategy)
			// Alternatively we could concat: target[key] = targetValue.concat(sourceValue);
			target[key] = sourceValue;
		} else if (isObject(targetValue) && isObject(sourceValue)) {
			target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
		} else {
			target[key] = sourceValue;
		}
	});

	return target;
}

export function mergeProductJSON(original: any, overrides: any): any {
	if (!overrides) return original;
	// Deep clone original to avoid mutation
	const clone = JSON.parse(JSON.stringify(original));
	return mergeDeep(clone, overrides);
}

export function mergeDAJSON(original: any, overrides: any): any {
	if (!overrides) return original;
	// Deep clone original to avoid mutation
	const clone = JSON.parse(JSON.stringify(original));
	return mergeDeep(clone, overrides);
}
