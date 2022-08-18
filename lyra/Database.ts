// deno-lint-ignore-file ban-types no-explicit-any
import { PropertiesSchema, SearchParams } from 'https://cdn.skypack.dev/@nearform/lyra@v0.0.4?dts';
import { LyraCollection, LyraConfig } from './Collection.ts';
import { LyraQuery } from './Query.ts';
import { ForcedSchema } from "./types.ts";

export class LyraDatabase {
	#collections = new Map<string, LyraCollection<{}>>();
	#defaults: LyraConfig<{}> = {
		defaultLanguage: 'english',
		edge: true,
		schema: {},
	};

	#name(name: string): string {
		const ext = '.msp';
		if (name.endsWith(ext)) return name;

		return name + ext;
	}

	#create<T extends PropertiesSchema = {}>(name: string, config: LyraConfig<T>): LyraCollection<T> {
		const col = new LyraCollection({
			path: this.#name(name),
			...this.#defaults,
			...config,
		});

		this.#collections.set(name, col);

		return col;
	}

	fromDoc<T>(
		name: string,
		doc: T,
		defaultLanguage: LyraConfig<ForcedSchema<T>>['defaultLanguage'] = 'english',
		edge = true,
	): LyraCollection<ForcedSchema<T>> {
		const schema: ForcedSchema<T> = {} as any;
		for (const [key, value] of Object.entries(doc) as [keyof T, unknown][]) {
			switch (typeof value) {
				case 'number':
					schema[key] = 'number' as any;
					break;
				case 'boolean':
					schema[key] = 'boolean' as any;
					break;
				case 'object':
				case 'string':
					schema[key] = 'string' as any;
					break;
			}
		}
		const db = this.#create(name, { defaultLanguage, edge, schema });
		db.insert(doc);
		return db;
	}

	from<T extends PropertiesSchema = {}>(name: string, config?: LyraConfig<T>): LyraCollection<T> {
		const col = this.#collections.get(name) as LyraCollection<T> ?? this.#create(name, { schema: {}, ...config });

		return col;
	}

	select<T extends PropertiesSchema = {}>(properties?: SearchParams<T>['properties']): LyraQuery<T> {
		return new LyraQuery<T>(this).select(properties);
	}
}
