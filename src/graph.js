// import { Graph as BaseGraph } from 'graph-data-structure'

// import { Id, Set } from './types'

// const splitEdge = (edge) => edge.split('->')
// const joinEdge = (edge) => edge.join('->')
// const addEdgeToGraph = (graph, edge) =>
//     Id.of(edge)
//         .map(splitEdge)
//         .map(([from, to]) => graph.addEdge(from, to))
//         .extract()

// const edgesToGraph = (edges) => edges.reduce(addEdgeToGraph, new BaseGraph())

// const Edges = (set) => {
//     const unpack = (f) =>
//         Id.of(set)
//             .map((set) => set.map(splitEdge))
//             .map(f)
//             .map((splitSet) => splitSet.map(joinEdge))
//             .map((set) => Edges(set))
//             .extract()

//     return {
//         set,
//         unpack,
//         reduce: (f, initial) => set.reduce(f, initial),
//         concat: (other) => set.concat(other.set),
//         map: (f) => unpack((set) => set.map(([from, to]) => f(from, to))),
//         filter: (f) => unpack((set) => set.filter(f)),
//     }
// }
// Edges.of = (edgeIds) => Edges(Set(edgeIds))

// Edges.empty = () => Edges(Set())

// const Graph = (edges) => {
//     const graph = edgesToGraph(edges)
//     return {
//         edges,
//         graph,
//         concat: (other) => Graph(edges.concat(other.edges)),
//         sortedNodes: () => graph.topologicalSort(),
//         adjacent: (node) => graph.adjacent(node),
//         mapEdges: (f) =>
//             Id.of(edges)
//                 .map((edges) => edges.map(f))
//                 .map((edges) => edges.filter((edge) => !!edge))
//                 .map((edges) => Graph(edges))
//                 .extract(),
//     }
// }

// Graph.of = (edgeIds) => Graph(Edges(edgeIds))

// Graph.empty = () => Graph(Edges.empty())

// export default Graph
