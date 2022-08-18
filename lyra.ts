import { LyraDatabase } from './lyra/Database.ts';

const db = LyraDatabase.fromDoc({
	id: '1.0',
	quote: 'It is during our darkest moments that we must focus to see the light.',
	author: 'Aristotle',
	what: [],
	who: [],
});
const { id } = db.insert({
	id: '2.0',
	quote: 'If you really look closely, most overnight successes took a long time.',
	author: 'Steve Jobs',
});
db.insert({
	id: '3.0',
	quote: 'If you are not willing to risk the usual, you will have to settle for the ordinary.',
	author: 'Jim Rohn',
	who: ['me'],
});
db.insert({
	id: '4.0',
	quote: 'You miss 100% of the shots you don\'t take',
	author: 'Wayne Gretzky - Michael Scott',
});

const searchResult = db.search({
	term: 'if',
	properties: '*',
});

console.log(searchResult);

db.save('./db.msp');

db.restore('./db.msp');

const searchResult2 = db.search({
	term: 'if',
	properties: '*',
});

console.log(searchResult2);

console.log(id, db.get(id));
