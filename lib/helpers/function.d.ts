export interface Fn<Arg = unknown, Return = unknown> {
	arg: Arg;
	_returnType: Return;
	return: unknown;
}

export namespace Fn {
	export type call<f extends Fn, arg extends f["arg"]> = unknown extends f["_returnType"]
		? (f & { arg: arg })["return"]
		: (f & { arg: arg })["return"] extends infer res extends f["_returnType"]
			? res
			: never;

	export type pipe<acc, fs extends Fn[]> = fs extends [
		infer head extends Fn,
		...infer tail extends Fn[],
	]
		? pipe<call<head, acc>, tail>
		: acc;
}
