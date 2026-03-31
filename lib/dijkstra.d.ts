import type { Edge, Graph } from "./graph";
import type { Fn, inf, List, lt, nil, plus, Table } from "./helpers";

export type shortestPath<
	src extends string,
	des extends string,
	g extends Graph,
> =
	Graph.mem<src, g> extends false
		? `Vertex ${src} does not exist`
		: Graph.mem<des, g> extends false
			? `Vertex ${des} does not exist`
			: search<src, des, g>;

type search<
	src extends string,
	des extends string,
	g extends Graph,
	current extends Node = Node<src, 0>,
	remaining extends NodeQueue = Fn.pipe<
		Graph.vertices<g>,
		[List.map<Node.ofDist<inf>>, NodeQueue.ofList, NodeQueue.remove<current>]
	>,
> = des extends current["name"]
	? Node.resolve<current>
	: Fn.pipe<
				Graph.edges<current["name"], g>,
				[
					List.filterMap<relax<remaining, current>>,
					List.fold<NodeQueue.update, remaining>,
					NodeQueue.popMin,
				]
			> extends [infer next extends Node, infer nextRemaining extends NodeQueue]
		? next["dist"] extends inf
			? `No path from ${src} to ${des}`
			: search<src, des, g, next, nextRemaining>
		: /* Happens when all nodes have been visited.
			But visiting des should've terminated the loop already. */
			never;

interface relax<unvisited extends NodeQueue, current extends Node>
	extends Fn<Edge, Node | nil> {
	return: this["arg"] extends Edge<infer _, infer name, infer edgeLength>
		? NodeQueue.find<name, unvisited> extends infer neighbor extends Node
			? plus<current["dist"], edgeLength> extends infer newDist extends number
				? lt<newDist, neighbor["dist"]> extends true
					? Node<name, newDist, current>
					: nil
				: never
			: nil
		: never;
}

type Node<
	name extends string = string,
	dist extends number = number,
	prev = unknown,
> = { name: name; dist: dist; prev: prev };
declare namespace Node {
	export interface ofDist<dist extends number> extends Fn<string> {
		return: Node<this["arg"], dist>;
	}

	export interface cmp extends Fn<[Node, Node], boolean> {
		return: lt<this["arg"][0]["dist"], this["arg"][1]["dist"]>;
	}

	export type resolve<node extends Node> = {
		path: buildPath<node>;
		dist: node["dist"];
	};
	type buildPath<node extends Node, acc extends string = ""> =
		node extends Node<infer name, infer _, infer prev>
			? (acc extends "" ? name : `${name} -> ${acc}`) extends infer acc extends
					string
				? prev extends Node
					? buildPath<prev, acc>
					: acc
				: never
			: never;
}

type NodeQueue = Table;
declare namespace NodeQueue {
	export type ofList = List.fold<update, Table.empty>;

	export interface update extends Fn<[NodeQueue, Node], NodeQueue> {
		return: Table.update<
			this["arg"][1]["name"],
			this["arg"][1],
			this["arg"][0]
		>;
	}

	export interface remove<node extends Node> extends Fn<NodeQueue, NodeQueue> {
		return: Table.remove<node["name"], this["arg"]>;
	}

	export type find<name extends string, queue extends NodeQueue> =
		Table.get<name, queue> extends infer node extends Node ? node : nil;

	export interface popMin extends Fn<NodeQueue, [Node, NodeQueue] | nil> {
		return: Fn.pipe<
			this["arg"],
			[Table.values, List.min<Node.cmp>]
		> extends infer min extends Node
			? [min, Fn.call<remove<min>, this["arg"]>]
			: nil;
	}
}
