export interface SimpleMxGraphNode {
    id?: string;
    shapeType?: 'decision' | 'terminator' | 'process';
    value?: string;
    cmd?: string;
    next_true?: string;
    next_false?: string;
    next?: string;
}
