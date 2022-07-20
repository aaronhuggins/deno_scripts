// deno-lint-ignore-file no-explicit-any
export class CFIle {
	[key: string]: any
	__isFile = true;

	static isFile(input: any): input is CFIle {
		return typeof input === 'object' && input?.__isFile;
	}

	constructor(input: Record<string, any>) {
		Object.assign(this, input ?? {});
	}

	/** Write this file to disk at path, including file name. */
	async write(path: string) {
		await Deno.writeTextFile(path, JSON.stringify(this, null, '\t') + '\n');
	}

	toJSON() {
		return {
			...this,
			__isFile: undefined,
			write: undefined,
		};
	}
}
