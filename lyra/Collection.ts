// deno-lint-ignore-file no-explicit-any
import {
	Configuration,
	create,
	insert,
	load,
	Lyra,
	PropertiesSchema,
	save,
	search,
	SearchParams,
	SearchResult,
} from 'https://cdn.skypack.dev/@nearform/lyra@v0.0.4?dts';
import { decode, encode } from 'https://deno.land/x/msgpackr@v1.6.0/index.js';
import type { ForcedSchema, SchemaLike } from './types.ts';
import { desiccate, hydrate } from './utils.ts';

export interface LyraConfig<T extends PropertiesSchema> extends Configuration<T> {
	path?: string;
}

export class LyraCollection<T extends PropertiesSchema> {
	static fromDoc<T>(
		doc: T,
		defaultLanguage: LyraConfig<any>['defaultLanguage'] = 'english',
		edge = true,
	): LyraCollection<ForcedSchema<T>> {
		const schema: ForcedSchema<T> = {} as any;
		for (const [key, value] of Object.entries(doc) as [keyof T, any][]) {
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
		const db = new LyraCollection({ defaultLanguage, edge, schema });
		db.insert(doc);
		return db;
	}

	#db: Lyra<T>;
	#path = './lyra_db.msp';

	constructor(config: LyraConfig<T>) {
		this.#db = create(config);
		this.#path = config.path ?? this.#path;
	}

	get(id: string): SchemaLike<T> | undefined {
		const result = this.#db.docs[id];
		if (result) return hydrate(result as any) as any;
	}

	search(params: SearchParams<T>): SearchResult<T> {
		const result = search(this.#db, params);

		result.hits = result.hits.map(hydrate as any);

		return result;
	}

	insert(doc: SchemaLike<T>): { id: string } {
		return insert(this.#db, desiccate(doc) as any);
	}

	save(path?: string) {
		this.#path = path ?? this.#path;
		const exported = save(this.#db);
		Deno.writeFileSync(this.#path, encode(exported));
	}

	restore(path?: string) {
		this.#path = path ?? this.#path;
		this.#db = create<any>({ schema: { __placeholder: 'string' } });
		const data = decode(Deno.readFileSync(this.#path));

		load(this.#db, data);
	}
}
