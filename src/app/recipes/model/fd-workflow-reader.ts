import * as fdModel from '@fd-model';
import { SimpleMxGraph } from './simple-mx-graph';
import { SimpleMxGraphUtils } from './simple-mx-graph-utils';
import { SimpleMxGraphNode } from './simple-mx-graph-node';

export class FdWorkflowReader {
    public convert(graph: SimpleMxGraph) {
        const result: fdModel.WorkflowItem[] = [];

        SimpleMxGraphUtils.traverse(graph, graph.__start, {}, n => {
            switch (n.shapeType) {
                case 'terminator':
                    if (SimpleMxGraphUtils.isStartNode(n)) {
                        result.push(this.createStart(n));
                    } else if (SimpleMxGraphUtils.isEndNode(n)) {
                        result.push(this.createEnd(n));
                    }
                    break;

                case 'process':
                    result.push(this.createProcess(n));
                    break;

                case 'decision':
                    result.push(this.createCondition(n));
                    break;
            }
        });

        return result;
    }

    private createStart(n: SimpleMxGraphNode) {
        return <fdModel.WfStart>{
            type: 'start',
            id: n.id,
            comment: 'Start',
            next_id: n.next
        };
    }

    private createEnd(n: SimpleMxGraphNode) {
        return <fdModel.WfEnd>{
            type: 'end',
            id: n.id
        };
    }

    private createProcess(n: SimpleMxGraphNode) {
        return <fdModel.WfAction>{
            type: 'action',
            id: n.id,
            comment: n.value,
            cmd: n.cmd,
            next_id: n.next
        };
    }

    private createCondition(n: SimpleMxGraphNode) {
        return <fdModel.WfCondition>{
            type: 'condition',
            id: n.id,
            comment: n.value,
            cmd: n.cmd,
            next_id_true: n.next_true,
            next_id_false: n.next_false
        };
    }
}
