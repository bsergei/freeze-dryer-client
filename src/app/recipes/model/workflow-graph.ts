import * as mx from 'mxgraph';
import { WorkflowItem, WfStart, WfAction, WfCondition } from '@fd-model';

const mxgraph = mx.default({});

export class WorkflowGraph {
    private graph: mx.mxgraph.mxGraph;
    private defaultParent: mx.mxgraph.mxCell;

    private map: { [key: string]: mx.mxgraph.mxCell } = {};
    private roots: mx.mxgraph.mxCell[] = [];

    private lastHighlightedCell: mx.mxgraph.mxCell;
    private lastColor: string;

    constructor(private items: WorkflowItem[], container: HTMLElement) {
        this.graph = this.createGraph(container);
        this.defaultParent = this.graph.getDefaultParent();

        this.setDefaultStyle();
        this.setupTooltips();

        this.graph.getModel().beginUpdate();
        try {
            for (const item of items) {
                this.appendVertex(item);
            }

            for (const item of items) {
                this.appendEdges(item);
            }

            this.applyLayout();
        }
        finally {
            this.graph.getModel().endUpdate();
        }
    }

    public highlight(id: string, hlColor = 'green', keepTrack = false) {
        let cell: mx.mxgraph.mxCell;
        let color: string;
        if (id) {
            cell = this.graph.getModel().getCell(id);
            if (cell) {
                color = this.graph.getCellStyle(cell)[mxgraph.mxConstants.STYLE_FILLCOLOR];
                if (color === hlColor) {
                    return;
                }
                this.graph.setCellStyles(mxgraph.mxConstants.STYLE_FILLCOLOR,hlColor, [cell]);
                this.graph.refresh(cell);
            }
        }
        else {
            cell = undefined;
        }

        if (this.lastHighlightedCell) {
            const c = this.lastHighlightedCell;
            const col = this.lastColor;
            const f = () => {
                this.graph.setCellStyles(mxgraph.mxConstants.STYLE_FILLCOLOR, col, [c]);
                this.graph.refresh(c);
            };
            if (keepTrack) {
                setTimeout(() => f(), 50);
            } else {
                f();
            }
        }

        this.lastHighlightedCell = cell;
        this.lastColor = color;
    }

    public destroy() {
        this.graph.destroy();
    }

    private appendEdges(item: WorkflowItem) {
        const src = this.map[item.id];
        switch (item.type) {
            case 'start':
                const target1 = this.map[(item as WfStart).next_id];
                if (target1) {
                    this.graph.insertEdge(this.defaultParent, null, '', src, target1);
                }
                break;
            case 'action':
                const target2 = this.map[(item as WfAction).next_id];
                if (target2) {
                    this.graph.insertEdge(this.defaultParent, null, '', src, target2);
                }
                break;
            case 'condition':
                const targetTrue = this.map[(item as WfCondition).next_id_true];
                if (targetTrue) {
                    this.graph.insertEdge(this.defaultParent, null, 'true', src, targetTrue);
                }
                const targetFalse = this.map[(item as WfCondition).next_id_false];
                if (targetFalse) {
                    this.graph.insertEdge(this.defaultParent, null, 'false', src, targetFalse);
                }
                break;
        }
    }

    private appendVertex(item: WorkflowItem) {
        const defaultWidth = 150;
        switch (item.type) {
            case 'start':
                const start = this.graph.insertVertex(this.defaultParent, item.id, item.id, 0, 0, defaultWidth, 40, 'shape=ellipse');
                this.graph.setCellStyles(mxgraph.mxConstants.STYLE_PERIMETER, mxgraph.mxPerimeter.EllipsePerimeter, [start]);
                this.graph.setCellStyles(mxgraph.mxConstants.STYLE_FILLCOLOR, '#FFF2CB', [start]);
                this.map[item.id] = start;
                this.roots.push(start);
                break;
            case 'end':
                const end = this.graph.insertVertex(this.defaultParent, item.id, item.id, 0, 0, defaultWidth, 40, 'shape=ellipse');
                this.graph.setCellStyles(mxgraph.mxConstants.STYLE_PERIMETER, mxgraph.mxPerimeter.EllipsePerimeter, [end]);
                this.graph.setCellStyles(mxgraph.mxConstants.STYLE_FILLCOLOR, '#FFF2CB', [end]);
                this.map[item.id] = end;
                break;
            case 'action':
                const action = this.graph.insertVertex(this.defaultParent, item.id, item.id, 0, 0, defaultWidth, 40, 'shape=rectangle');
                this.graph.setCellStyles(mxgraph.mxConstants.STYLE_FILLCOLOR, '#C6DBFF', [action]);
                this.map[item.id] = action;
                break;
            case 'condition':
                const condition = this.graph.insertVertex(this.defaultParent, item.id, item.id, 0, 0, defaultWidth, 60, 'shape=rhombus');
                this.graph.setCellStyles(mxgraph.mxConstants.STYLE_PERIMETER, mxgraph.mxPerimeter.RectanglePerimeter, [condition]);
                this.graph.setCellStyles(mxgraph.mxConstants.STYLE_FILLCOLOR, '#5890B1', [condition]);
                this.map[item.id] = condition;
                break;
        }
    }

    private createGraph(container: any) {
        const graph = new mxgraph.mxGraph(container);
        graph.panningHandler.useLeftButtonForPanning = true;
        graph.panningHandler.ignoreCell = true;
        graph.setPanning(true);
        graph.setEnabled(false);
        graph.setTooltips(true);
        graph.keepEdgesInBackground = true;
        return graph;
    }

    private setDefaultStyle() {
        const style = this.graph.getStylesheet().getDefaultVertexStyle();
        style[mxgraph.mxConstants.STYLE_PERIMETER] = mxgraph.mxPerimeter.RectanglePerimeter;
        style[mxgraph.mxConstants.STYLE_GRADIENTCOLOR] = 'white';
        style[mxgraph.mxConstants.STYLE_PERIMETER_SPACING] = 1;
        style[mxgraph.mxConstants.STYLE_ROUNDED] = true;
        style[mxgraph.mxConstants.STYLE_SHADOW] = true;

        const styleEdge = this.graph.getStylesheet().getDefaultEdgeStyle();
        styleEdge[mxgraph.mxConstants.STYLE_ROUNDED] = true;
    }

    private applyLayout() {
        const layout = new mxgraph.mxHierarchicalLayout(this.graph);
        const l: any = layout;
        l.intraCellSpacing = 100; // default: 30
        l.interHierarchySpacing = 60; // default: 60
        l.interRankCellSpacing = 40; // default: 50
        layout.execute(this.defaultParent, this.roots);

        this.graph.moveCells(this.defaultParent.children, 50, 15);
    }

    private setupTooltips() {
        this.graph.getTooltipForCell = (cell: mx.mxgraph.mxCell) => {
            const id = cell.getId();
            const item = this.items.find(i => i.id === id);
            if (item) {
                return `<b>id: </b>'${item.id}'
<b>type: </b>'${item.type}'
<b>comment: </b>'${(item.comment || '')}'
<b>cmd: </b>'${(item.cmd || '')}'`;
            }
            return null;
        };
    }
}