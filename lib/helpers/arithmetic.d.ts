import type { nil } from "./nil";

type tupleOf<
	length extends number,
	acc extends unknown[] = [],
> = length extends acc["length"] ? acc : tupleOf<length, [...acc, 0]>;

// largest representable number, since 1000 is TS recursion limit
export type inf = 999;

export type minus<a extends number, b extends number> =
	tupleOf<a> extends [...tupleOf<b>, ...infer remaining]
		? remaining["length"]
		: nil;

export type plus<a extends number, b extends number> = [
	...tupleOf<a>,
	...tupleOf<b>,
]["length"];

export type lt<a extends number, b extends number> =
	minus<a, b> extends number ? false : true;
