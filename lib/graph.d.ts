import type { Fn } from "./helpers/function";
import type { List } from "./helpers/list.d.ts";
import type { nil } from "./helpers/nil";
import type { Table } from "./helpers/table";

export type Edge<
	src extends string = string,
	des extends string = string,
	len extends number = number,
> = { src: src; des: des; len: len };
declare namespace Edge {
	export type reverse<e extends Edge> =
		e extends Edge<infer src, infer des, infer len>
			? Edge<des, src, len>
			: never;

	export interface des extends Fn<Edge, string> {
		return: this["arg"]["des"];
	}
}

export type Graph = Table;
export namespace Graph {
	export type of<
		edges extends Edge[],
		acc extends Graph = Table.empty,
	> = edges extends [infer head extends Edge, ...infer tail extends Edge[]]
		? of<tail, addEdge<head, acc>>
		: acc;

	export type vertices<g extends Graph> =
		Table.keys<g> extends infer vs extends string[] ? vs : never;

	export type transpose<
		g extends Graph,
		edges extends Edge[] = Table.values<g> extends infer edgeLists extends
			Edge[][]
			? List.flatten<edgeLists>
			: never,
		acc extends Graph = Table.empty,
	> = edges extends [infer head extends Edge, ...infer tail extends Edge[]]
		? transpose<g, tail, addEdge<Edge.reverse<head>, acc>>
		: acc;

	export type edges<v extends string, g extends Graph> =
		Table.get<v, g> extends infer es extends Edge[] ? es : nil;

	export type neighbors<v extends string, g extends Graph> = List.map<
		Edge.des,
		edges<v, g>
	>;

	export type mem<v extends string, g extends Graph> = Table.mem<v, g>;
}

type addEdge<e extends Edge, g extends Graph> = (
	Graph.edges<e["src"], g> extends infer edges extends Edge[]
		? Table.update<e["src"], [...edges, e], g>
		: Table.insert<e["src"], [e], g>
) extends infer g extends Graph
	? Graph.mem<e["des"], g> extends false
		? Table.insert<e["des"], [], g>
		: g
	: never;
