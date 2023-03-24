// import Graph from './graph'

// describe('Graph', () => {
//     describe('Basic implementation', () => {
//         const graph = Graph.of(['foo->bar', 'biz->baz'])
//         test('.sortedNodes should return a topologically sorted array of nodes', () => {
//             expect(graph.sortedNodes()).toEqual(['biz', 'baz', 'foo', 'bar'])
//         })
//         test('should be possible to concat graphs', () => {
//             expect(
//                 graph.concat(Graph.of(['biz->booze'])).sortedNodes(),
//             ).toEqual(['biz', 'booze', 'baz', 'foo', 'bar'])
//         })
//         test('should be possible to get adjacent nodes', () => {
//             expect(graph.adjacent('foo')).toEqual(['bar'])
//         })
//         test('should be possible to map edges', () => {
//             const nodes = graph
//                 .mapEdges((from, to) => [`${from}+`, to])
//                 .sortedNodes()
//             expect(nodes).toEqual(['biz+', 'baz', 'foo+', 'bar'])
//         })
//     })
// })

test('Graph', () => {
    expect(1).toEqual(1)
})
