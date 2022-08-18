// deno-lint-ignore-file ban-types
import type { PropertiesSchema, SearchParams, SearchResult } from 'https://cdn.skypack.dev/@nearform/lyra@v0.0.4?dts';
import type { LyraCollection } from './Collection.ts';

interface LyraDatabaseLike {
	from<T extends PropertiesSchema = {}>(name: string): LyraCollection<T>;
}

export class LyraQuery<S extends PropertiesSchema = {}> {
	#db: LyraDatabaseLike;
	#params: SearchParams<S> = {
		term: '',
	};
	#from: Set<LyraCollection<S>>;

	constructor(db: LyraDatabaseLike) {
		this.#db = db;
		this.#from = new Set();
	}

	select(properties?: SearchParams<S>['properties']): LyraQuery<S> {
		this.#params.properties = properties ?? '*';
		return this;
	}

	from(name: string): LyraQuery<S> {
		this.#from.add(this.#db.from(name));
		return this;
	}

	where(term: string): LyraQuery<S> {
		this.#params.term = term;
		return this;
	}

	limit(count: number): LyraQuery<S> {
		this.#params.limit = count;
		return this;
	}

	offset(offset: number): LyraQuery<S> {
		this.#params.offset = offset;
		return this;
	}

	exact(exact: boolean): LyraQuery<S> {
		this.#params.exact = exact;
		return this;
	}

	tolerance(tolerance: number): LyraQuery<S> {
		this.#params.tolerance = tolerance;
		return this;
	}

	search (): SearchResult<S> {
		const result: SearchResult<S> = {
			count: 0,
			elapsed: 0n,
			hits: []
		}

		for (const col of this.#from) {
			const res = col.search(this.#params)
			result.count += res.count
			result.elapsed += res.elapsed
			result.hits.push(...res.hits)
		}

		return result
	}
}
