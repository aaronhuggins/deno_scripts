// deno-lint-ignore-file no-explicit-any
import { Desiccate } from './types.ts';

const startChars = ['[', '{'];
const endChars = [']', '}'];

function isJsonLike(input: string): boolean {
	return startChars.includes(input[0]) && endChars.includes(input[input.length - 1]);
}

function safeJson(input: string): any {
	try {
		return JSON.parse(input);
	} catch (_) {
		return input;
	}
}

export function desiccate<T extends Record<string | number | symbol, any>>(input: T): Desiccate<T> {
	const copy: Desiccate<T> = {} as any;
	for (const [key, value] of Object.entries(input) as [keyof T, any][]) {
		if (Array.isArray(value) || typeof value === 'object') {
			copy[key] = JSON.stringify(value);
		} else copy[key] = value;
	}
	return copy;
}

export function hydrate<T extends Record<string | number | symbol, any>>(input: Desiccate<T>): T {
	const copy: T = {} as any;
	for (const [key, value] of Object.entries(input) as [keyof T, any][]) {
		if (typeof value === 'string' && isJsonLike(value)) {
			copy[key] = safeJson(value);
		} else copy[key] = value;
	}
	return copy;
}
