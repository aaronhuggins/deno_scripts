// deno-lint-ignore-file no-explicit-any
import {
	create,
	insert,
	Lyra,
	PropertiesSchema,
	save,
	search,
} from 'https://cdn.skypack.dev/@nearform/lyra@v0.0.4?dts';
import { decode, encode } from 'https://deno.land/x/msgpackr@v1.6.0/index.js';

type Desiccate<T> = {
	[Property in keyof T]: T[Property] extends Record<string | number | symbol, any> ? string
		: T[Property] extends any[] ? string
		: T[Property];
};

type Hydrate<T, P extends string | number | symbol> =
	& Omit<T, P>
	& Record<P, Record<string | number | symbol, any> | any[]>;

function desiccate<T extends Record<string | number | symbol, any>>(input: T): Desiccate<T> {
	const copy: Desiccate<T> = {} as any;

	for (const [key, value] of Object.entries(input) as [keyof T, any][]) {
		if (Array.isArray(value) || typeof value === 'object') {
			copy[key] = JSON.stringify(value);
		} else copy[key] = value;
	}

	return copy;
}

function hydrate<T extends Record<string | number | symbol, any>>(input: Desiccate<T>): T {
	const startChars = ['[', '{'];
	const endChars = [']', '}'];
	const copy: T = {} as any;

	for (const [key, value] of Object.entries(input) as [keyof T, any][]) {
		if (typeof value === 'string' && startChars.includes(value[0]) && endChars.includes(value[value.length - 1])) {
			try {
				copy[key] = JSON.parse(value);
				continue;
			} catch (_) {
				// Don't care, assign invalid JSON as a string.
			}
		}
		copy[key] = value;
	}

	return copy;
}

function persist<T extends PropertiesSchema>(db: Lyra<T>, path: string) {
	const exported = save(db);
	Deno.writeFileSync(path, encode(exported));
}

function restore<T extends PropertiesSchema>(path: string): Lyra<T> {
	const db = create({ schema: { __placeholder: 'string' } });
	const data = decode(Deno.readFileSync(path));
	db.index = data.index;
	db.docs = data.docs;
	db.nodes = data.nodes;
	db.schema = data.schema;

	return db as unknown as Lyra<T>;
}

const db = create<Record<string, any>>({
	defaultLanguage: 'english',
	edge: true,
	schema: {
		author: 'string',
		quote: 'string',
		what: 'string',
		who: 'string',
	},
});

console.log(
	'id',
	insert(
		db,
		desiccate({
			quote: 'It is during our darkest moments that we must focus to see the light.',
			author: 'Aristotle',
			what: [],
		}),
	),
);

insert(db, {
	quote: 'If you really look closely, most overnight successes took a long time.',
	author: 'Steve Jobs',
});

insert(
	db,
	desiccate({
		quote: 'If you are not willing to risk the usual, you will have to settle for the ordinary.',
		author: 'Jim Rohn',
		who: ['me'],
	}),
);

insert(db, {
	quote: 'You miss 100% of the shots you don\'t take',
	author: 'Wayne Gretzky - Michael Scott',
});

const searchResult = search(db, {
	term: 'if',
	properties: '*',
} as any);

console.log(searchResult);

persist(db, './db.msp');

const db2 = restore('./db.msp');

const searchResult2 = search(db2, {
	term: 'if',
	properties: '*',
});

console.log(searchResult2);
