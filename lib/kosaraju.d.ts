import type { Graph } from "./graph";
import type { Fn } from "./helpers/function";
import type { List } from "./helpers/list";
import type { Table } from "./helpers/table";

export type stronglyConnectedComponents<g extends Graph> = dfs<
	Graph.transpose<g>,
	List.reverse<dfs<g>["exitOrder"]>
>["components"];

type dfs<
	g extends Graph,
	vertices extends string[] = Graph.vertices<g>,
	visited extends NodeSet = NodeSet.empty,
	exitOrder extends string[] = [],
	components extends unknown[] = [],
> = vertices extends [infer node extends string, ...infer rest extends string[]]
	? NodeSet.mem<node, visited> extends true
		? dfs<g, rest, visited, exitOrder, components>
		: explore<g, visited, node> extends ExpState<
					infer newVisited,
					infer nodeExitOrder
				>
			? dfs<
					g,
					rest,
					newVisited,
					[...exitOrder, ...nodeExitOrder],
					[...components, nodeExitOrder]
				>
			: never
	: { exitOrder: exitOrder; components: components };

type ExpState<visited extends NodeSet, exitOrder extends string[] = []> = {
	visited: visited;
	exitOrder: exitOrder;
};

type explore<
	g extends Graph,
	visited extends NodeSet,
	node extends string,
> = Fn.call<exploreFn<g>, [ExpState<visited>, node]>;

interface exploreFn<g extends Graph> extends Fn<[unknown, string]> {
	return: this["arg"] extends [
		ExpState<infer visited, infer exitOrder>,
		infer node extends string,
	]
		? NodeSet.mem<node, visited> extends true
			? ExpState<visited, exitOrder>
			: List.fold<
						exploreFn<g>,
						ExpState<NodeSet.add<node, visited>, exitOrder>,
						Graph.neighbors<node, g>
					> extends ExpState<infer newVisited, infer newExitOrder>
				? ExpState<newVisited, [...newExitOrder, node]>
				: never
		: never;
}

type NodeSet = Table;
declare namespace NodeSet {
	export type empty = Table.empty;
	export type add<n extends string, s extends NodeSet> = Table.insert<n, 0, s>;
	export type mem<n extends string, s extends NodeSet> = Table.mem<n, s>;
}
