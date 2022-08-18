import { CDir } from './lib/DIR.ts';
import { CFIle } from './lib/CFIle.ts';

type Cmd = 'init';

const cmd: Cmd = Deno.args[0] as Cmd;

const init = new CDir({
	'.vscode': new CDir({
		'settings.json': new CFIle({
			'files.exclude': {
				'**/.git': true,
				'**/.DS_Store': true,
				'**/*.js': {
					'when': '$(basename).ts',
				},
			},
			'editor.insertSpaces': false,
			'editor.tabSize': 2,
			'deno.enable': true,
			'deno.codeLens.test': true,
			'deno.codeLens.testArgs': [
				'--allow-all',
			],
			'deno.lint': true,
			'deno.suggest.autoImports': true,
			'deno.suggest.imports.autoDiscover': true,
			'deno.suggest.paths': true,
			'deno.unstable': true,
			'deno.suggest.imports.hosts': {
				'https://deno.land': true,
			},
		}).json(),
	}),
	'deno.jsonc': new CFIle({
		fmt: {
			options: {
				useTabs: true,
				lineWidth: 120,
				proseWrap: 'always',
				indentWidth: 2,
				singleQuote: true,
			},
		},
	}).jsonc(),
});

switch (cmd) {
	case 'init': {
		console.log('Initializing Deno configs');
		await init.write();
		break;
	}
	default: {
		console.log('Nothing to do.');
	}
}
