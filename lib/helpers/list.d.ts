import type { Fn } from "./function.d.ts";
import type { nil } from "./nil";

export namespace List {
	export type fold<
		f extends Fn<[unknown, unknown]>,
		acc extends f["arg"][0],
		l = "curry",
	> = l extends "curry" ? foldFn<f, acc> : foldImpl<f, acc, l>;

	export type min<
		lt extends Fn<[unknown, unknown], boolean>,
		l extends unknown[],
	> = l extends [infer only]
		? only
		: l extends [infer first, infer second, ...infer rest]
			? min<lt, [takeMin<lt, first, second>, ...rest]>
			: nil;

	export interface filterMap<f extends Fn> extends Fn {
		return: filterMapImpl<f, this["arg"]>;
	}

	export type map<f extends Fn, l = "curry"> = l extends "curry"
		? mapFn<f>
		: mapImpl<f, l>;

	export type flatten<ls extends unknown[][]> = ls extends [
		infer head extends unknown[],
		...infer tail extends unknown[][],
	]
		? [...head, ...flatten<tail>]
		: [];

	export type reverse<l, acc extends unknown[] = []> = l extends [
		infer head,
		...infer tail extends unknown[],
	]
		? reverse<tail, [head, ...acc]>
		: acc;
}

type foldImpl<f extends Fn, acc, l> = l extends [infer head, ...infer tail]
	? foldImpl<f, Fn.call<f, [acc, head]>, tail>
	: acc;
interface foldFn<f extends Fn<[unknown, unknown]>, acc extends f["arg"][0]>
	extends Fn {
	return: foldImpl<f, acc, this["arg"]>;
}

type takeMin<lt extends Fn<[unknown, unknown], boolean>, a, b> =
	Fn.call<lt, [a, b]> extends true ? a : b;

type filterMapImpl<f extends Fn, l> = l extends [infer head, ...infer tail]
	? Fn.call<f, head> extends infer fHead
		? fHead extends nil
			? filterMapImpl<f, tail>
			: [fHead, ...filterMapImpl<f, tail>]
		: never
	: [];

type mapImpl<f extends Fn, l> = {
	[k in keyof l]: Fn.call<f, l[k]>;
};
interface mapFn<f extends Fn> extends Fn {
	return: mapImpl<f, this["arg"]>;
}
