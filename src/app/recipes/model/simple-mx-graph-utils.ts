import { SimpleMxGraph } from './simple-mx-graph';
import { SimpleMxGraphNode } from './simple-mx-graph-node';

export class SimpleMxGraphUtils {
    public static traverse(graph: SimpleMxGraph, node: SimpleMxGraphNode, visited: SimpleMxGraph, cb?: (node: SimpleMxGraphNode) => void) {
        if (!node) {
            throw new Error('Undefined node reference');
        }

        if (visited[node.id]) {
            return;
        }

        visited[node.id] = node;

        if (cb) {
            cb(node);
        }

        if (SimpleMxGraphUtils.isEndNode(node)) {
            return;
        }

        if (node.shapeType === 'decision') {
            SimpleMxGraphUtils.traverse(graph, graph[node.next_true], visited, cb);
            SimpleMxGraphUtils.traverse(graph, graph[node.next_false], visited, cb);
        } else {
            SimpleMxGraphUtils.traverse(graph, graph[node.next], visited, cb);
        }
    }

    public static isStartNode(node: SimpleMxGraphNode) {
        return node.shapeType === 'terminator' && node.value && node.value.toUpperCase() === 'START';
    }

    public static isEndNode(node: SimpleMxGraphNode) {
        return node.shapeType === 'terminator' && node.value && node.value.toUpperCase() === 'END';
    }
}
