import { SimpleMxGraphNode as SimpleMxGraphNode } from './simple-mx-graph-node';

export interface SimpleMxGraph {
    [idx: string]: SimpleMxGraphNode;
    __start?: SimpleMxGraphNode;
}
