// deno-lint-ignore-file no-explicit-any
import { CFIle } from './CFIle.ts';

export class CDir implements Iterable<[string, CDir | CFIle]> {
	[key: string]: any
	__isDir = true;

	static isDir(input: any): input is CDir {
		return typeof input === 'object' && input?.__isDir;
	}

	constructor(input: Record<string, any>) {
		Object.assign(this, input ?? {});
	}

	*[Symbol.iterator](): Iterator<[string, CDir | CFIle]> {
		for (const [key, value] of Object.entries(this)) {
			if (CDir.isDir(value) || CFIle.isFile(value)) yield [key, value];
		}
	}

	/** Defaults to current working directory path. */
	async write(path = '.') {
		if (path !== '.') await Deno.mkdir(path, { recursive: true });
		for (const [name, value] of this) {
			await value.write(`${path}/${name}`);
		}
	}
}
