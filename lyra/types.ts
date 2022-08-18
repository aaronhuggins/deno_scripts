// deno-lint-ignore-file no-explicit-any
export type SchemaLike<T extends Record<string | number | symbol, any>> = {
	[Property in keyof T]?: any;
};

export type ForcedSchema<T> = {
	[Property in keyof T]: T[Property] extends number ? 'number'
		: T[Property] extends boolean ? 'boolean'
		: 'string';
};

export type Desiccate<T> = {
	[Property in keyof T]: T[Property] extends Record<string | number | symbol, any> ? string
		: T[Property] extends any[] ? string
		: T[Property];
};
