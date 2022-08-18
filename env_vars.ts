declare let process: {
	env: Record<string, string>
}
declare let Deno: {
	env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
	}
}

export function getEnv (): Record<string, string> {
	const isNodeJS = typeof process === 'object' && typeof process.env === 'object'
	function getter (_: Record<string, string>, prop: string) {
		return isNodeJS
			? process.env[prop]
			: Deno.env.get(prop.toString())
	}

	return new Proxy<Record<string, string>>({}, {
		deleteProperty (_, prop: string) {
			const denoDelete = (key: string) => {
				try {
					Deno.env.delete(key)
					return true
				} catch (_) {
					return false
				}
			}
			return isNodeJS
				? (delete process.env[prop])
				: denoDelete(prop)
		},
		get: getter,
		getOwnPropertyDescriptor (_, prop: string) {
			return {
				enumerable: true,
				configurable: true,
				value: getter(_, prop)
			};
		},
		has (_, prop) {
			return isNodeJS
				? Object.prototype.hasOwnProperty.call(process.env, prop)
				: Object.prototype.hasOwnProperty.call(Deno.env.toObject(), prop)
		},
		set (_, prop: string, val) {
			if (isNodeJS) {
				process.env[prop] = val
			} else {
				Deno.env.set(prop, val)
			}

			return true
		},
		ownKeys (_) {
			return isNodeJS
				? Object.keys(process.env)
				: Object.keys(Deno.env.toObject())
		},
	})
}

export const env = getEnv()

export function env2dotenv (env: Record<string, string>, filter?: EnvMatches): string {
	const entries = Object.entries(env)
	const { length } = entries
	const matcher = makeRegExp(filter)
	let dotenv = ''

	if (length === 0) return dotenv

	for (let i = 0; i < length; i++) {
		const [key, value] = entries[i]
		if (matcher.test(key)) dotenv += `${key}=${value.includes('\n') ? JSON.stringify(value) : value}\n`
	}

	return dotenv
}

function makeRegExp<T extends string>(input?: EnvMatches<T>): RegExp {
	if (Array.isArray(input) && input.length > 0) {
		const negate: string[] = []
		const capture: string[] = []

		for (const matcher of input) {
			if (matcher.startsWith('!')) {
				const negator = matcher.substring(1)

				if (negator.endsWith('*')) {
					negate.push(negator.substring(0, negator.length - 1) + '.*')
				} else {
					negate.push(negator)
				}
			} else if (matcher.endsWith('*')) {
				capture.push(matcher.substring(0, matcher.length - 1) + '.*')
			} else {
				capture.push(matcher)
			}
		}

		const prefix = '^(?:'
		const suffix = ')$'
		let positive = '([A-Za-z_][A-Za-z0-9_%]+)'
		let negative = ''

		if (capture.length > 0) {
			positive = `(${capture.join('|')})`
		}

		if (negate.length > 0) {
			negative = `(?!(${negate.join('|')}))`
		}

		return new RegExp(`${prefix}${negative}${positive}${suffix}`, 'gu')
	}

	return /^[A-Za-z_][A-Za-z0-9_%]+$/gu
}

type ValidFirstChars =
	'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' |
	'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z'  |
	'_'
type ValidChars = ValidFirstChars | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '%'
type EnvVarTail<T extends string> =
	string extends T
		? never
		: T extends `${infer F}${""}${infer R}`
			? F extends ValidChars
				? `${F}${""}${EnvVarTail<R>}`
				: never
			: T;
export type EnvVar<T extends `${ValidFirstChars}${string}`> =
	string extends T
		? never
		: T extends `${infer F}${""}${infer R}`
			? F extends ValidFirstChars
				? `${F}${""}${EnvVarTail<R>}`
				: never
			: never;
export type EnvMatch<T extends string = string> = T | `!${T}` | `${T}*` | `!${T}*`
export type EnvMatches<T extends EnvMatch = EnvMatch> = [T, ...T[]]
