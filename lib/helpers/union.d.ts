// https://github.com/hackle/blog-rust/blob/master/sample/typescript-union-to-tuple-lay.ts

import type { nil } from "./nil";

export type toList<u> =
	pickOne<u> extends infer last
		? last extends nil
			? []
			: [...toList<Exclude<u, last>>, last]
		: never;

type pickOne<T> = inferContra<inferContra<contra<contra<T>>>>;
type contra<T> = T extends T ? (arg: T) => void : never;
type inferContra<T> = [T] extends [(arg: infer I) => void] ? I : nil;
