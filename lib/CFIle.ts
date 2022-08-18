// deno-lint-ignore-file no-explicit-any
import * as YAML from 'https://deno.land/std@0.150.0/encoding/yaml.ts';

export class CFIle {
	[key: string]: any
	__isFile = true;
	__type: 'json' | 'jsonc' | 'yaml' | 'text' = 'json';
	__contents = '';

	static isFile(input: any): input is CFIle {
		return typeof input === 'object' && input?.__isFile;
	}

	constructor(input?: Record<string, any>) {
		Object.assign(this, input ?? {});
	}

	/** Write this file to disk at path, including file name. */
	async write(path: string) {
		let data = '';

		switch (this.__type) {
			case 'json':
			case 'jsonc': {
				data = JSON.stringify(this, null, '\t') + '\n';
				break;
			}
			case 'yaml': {
				data = YAML.stringify(this.toJSON());
				break;
			}
			case 'text': {
				data = this.__contents.endsWith('\n') ? this.__contents : this.__contents + '\n';
				break;
			}
		}

		await Deno.writeTextFile(path, data);
	}

	json() {
		this.__type = 'json';
		return this;
	}

	jsonc() {
		this.__type = 'jsonc';
		return this;
	}

	yaml() {
		this.__type = 'yaml';
		return this;
	}

	text(contents = '') {
		this.__type = 'text';
		this.__contents = contents;
		return this;
	}

	toJSON(): any {
		return {
			...this,
			__isFile: undefined,
			__type: undefined,
			__contents: undefined,
			write: undefined,
			json: undefined,
			jsonc: undefined,
			yaml: undefined,
			text: undefined,
		};
	}
}
