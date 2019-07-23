import { SimpleMxGraph } from './simple-mx-graph';
import { SimpleMxGraphNode } from './simple-mx-graph-node';
import { SimpleMxGraphUtils } from './simple-mx-graph-utils';
import * as mx from 'mxgraph';

export class MxGraphReader {

    public convert(mxGraphXml: Document) {
        const mxCells = Array.from(mxGraphXml.querySelectorAll('mxCell'));
        const graph = this.createMxGraph(mxCells);
        this.linkEdges(mxCells, graph);

        const err = this.validate(graph);
        if (err) {
            throw new Error(`Graph validation error: ${err}`);
        }

        return graph;
    }

    public toPureMxGraphXml(drawIoGraphXml: Document) {
        const mxgraphXml = drawIoGraphXml.cloneNode(true) as Document;
        const objects = Array.from(mxgraphXml.querySelectorAll('object'));
        for (const objNode of objects) {
            const mxCell = objNode.querySelector('mxCell');
            mxCell.setAttribute('id', objNode.attributes.getNamedItem('id').value);
            mxCell.setAttribute('value', objNode.attributes.getNamedItem('label').value);
            objNode.parentNode.replaceChild(mxCell, objNode);
        }

        return mxgraphXml;
    }

    public toSvg(mxGraphXml: Document) {
        const background = '#ffffff';
        const scale = 1;
        const border = 1;

        const mxgraph = mx.default({});

        const container = (<Document>mxgraph.mxUtils.createXmlDocument()).createElement('div');
        if (!container.style) {
            (<any>container).style = {};
        }

        const graph = new mxgraph.mxGraph(container);
        const coder = new mxgraph.mxCodec(mxGraphXml);
        coder.decode(mxGraphXml.documentElement, graph.getModel());

        const imgExport = new mxgraph.mxImageExport();
        const bounds = graph.getGraphBounds();
        const vs = graph.view.scale;
        // Prepares SVG document that holds the output
        const svgDoc = mxgraph.mxUtils.createXmlDocument() as Document;
        const root = (svgDoc.createElementNS != null)
            ? svgDoc.createElementNS(mxgraph.mxConstants.NS_SVG, 'svg') as HTMLElement
            : svgDoc.createElement('svg');

        if (background != null) {
            if (root.style != null) {
                root.style.backgroundColor = background;
            } else {
                root.setAttribute('style', 'background-color:' + background);
            }
        }

        if (svgDoc.createElementNS == null) {
            root.setAttribute('xmlns', mxgraph.mxConstants.NS_SVG);
            root.setAttribute('xmlns:xlink', mxgraph.mxConstants.NS_XLINK);
        } else {
            // KNOWN: Ignored in IE9-11, adds namespace for each image element instead. No workaround.
            root.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', mxgraph.mxConstants.NS_XLINK);
        }

        root.setAttribute('width', (Math.ceil(bounds.width * scale / vs) + 2 * border) + 'px');
        root.setAttribute('height', (Math.ceil(bounds.height * scale / vs) + 2 * border) + 'px');
        root.setAttribute('version', '1.1');

        // Adds group for anti-aliasing via transform
        const group = (svgDoc.createElementNS != null) ?
            svgDoc.createElementNS(mxgraph.mxConstants.NS_SVG, 'g') : svgDoc.createElement('g');
        group.setAttribute('transform', 'translate(0.5,0.5)');
        root.appendChild(group);
        svgDoc.appendChild(root);
        // Renders graph. Offset will be multiplied with state's scale when painting state.
        const svgCanvas = new mxgraph.mxSvgCanvas2D(group, undefined);
        svgCanvas.translate(Math.floor((border / scale - bounds.x) / vs), Math.floor((border / scale - bounds.y) / vs));
        svgCanvas.scale(scale / vs);
        // Displayed if a viewer does not support foreignObjects (which is needed to HTML output)
        svgCanvas.foAltText = '[Not supported by viewer]';
        imgExport.drawState(graph.getView().getState(graph.model.root), svgCanvas);

        return root;
    }

    private validate(graph: SimpleMxGraph) {
        if (!graph.__start) {
            return 'No start node';
        }

        const visited: SimpleMxGraph = {};
        try {
            SimpleMxGraphUtils.traverse(graph, graph.__start, visited);
        } catch (e) {
            return (e as Error).message;
        }

        let hasEndNode = false;
        for (const n of Object.getOwnPropertyNames(visited)) {
            const node = visited[n];
            if (SimpleMxGraphUtils.isEndNode(node)) {
                hasEndNode = true;
            }
        }

        if (!hasEndNode) {
            return 'Unable to reach end node';
        }
    }

    private createMxGraph(mxCells: Element[]) {
        const nodeElements: SimpleMxGraph = {};
        for (const mxCell of mxCells) {
            if (this.isVertex(mxCell)) {
                const node = this.createNode(mxCell);
                nodeElements[node.id] = node;

                if (SimpleMxGraphUtils.isStartNode(node)) {
                    nodeElements.__start = node;
                }
            }
        }
        return nodeElements;
    }

    private createNode(mxCell: Element) {
        let idAttr = mxCell.attributes.getNamedItem('id');
        let valueAttr = mxCell.attributes.getNamedItem('value');
        let cmdAttr: Attr;

        const objectWrapper = mxCell.parentElement;
        if (objectWrapper && objectWrapper.nodeName === 'object') {
            idAttr = objectWrapper.attributes.getNamedItem('id');
            valueAttr = objectWrapper.attributes.getNamedItem('label');
            cmdAttr = objectWrapper.attributes.getNamedItem('cmd');
        }

        const shapeType = this.getVertexShapeType(mxCell);

        if (idAttr) {
            const node: SimpleMxGraphNode = {
                id: idAttr.value,
                shapeType: shapeType,
                value: valueAttr && valueAttr.value,
                cmd: cmdAttr && cmdAttr.value
            };
            return node;
        }
    }

    private linkEdges(mxCells: Element[], nodeElements: SimpleMxGraph) {
        for (const edge of mxCells) {
            if (this.isEdge(edge)) {
                const sourceAttr = edge.attributes.getNamedItem('source');
                const targetAttr = edge.attributes.getNamedItem('target');
                if (sourceAttr && targetAttr) {
                    const srcNode = nodeElements[sourceAttr.value];
                    const targetNode = nodeElements[targetAttr.value];

                    if (srcNode.shapeType === 'decision') {
                        const valueAttr = edge.attributes.getNamedItem('value');
                        const edgeValue = valueAttr && valueAttr.value;
                        if (edgeValue && (
                            edgeValue.toUpperCase() === 'TRUE'
                            || edgeValue.toUpperCase() === 'YES'
                            || edgeValue === '1')) {
                            srcNode.next_true = targetNode && targetNode.id;
                        } else if (edgeValue && (
                            edgeValue.toUpperCase() === 'FALSE'
                            || edgeValue.toUpperCase() === 'NO'
                            || edgeValue === '0')) {
                            srcNode.next_false = targetNode && targetNode.id;
                        }
                    } else {
                        srcNode.next = targetNode && targetNode.id;
                    }
                }
            }
        }
    }

    private isVertex(mxCell: Element) {
        return mxCell.attributes['vertex'] && mxCell.attributes['vertex'].value === '1';
    }

    private isEdge(mxCell: Element) {
        return mxCell.attributes['edge'] && mxCell.attributes['edge'].value === '1';
    }

    private getVertexShapeType(mxCell: Element) {
        const style = mxCell.attributes.getNamedItem('style');
        if (style) {
            const styleValue = style.value;
            const shapeRegex = /shape=(?<shape>[^;]+)/;
            const shapeRegexResult = styleValue.match(shapeRegex) as any;
            if (shapeRegexResult) {
                const shape = shapeRegexResult.groups['shape'];
                if (shape) {
                    switch (shape) {
                        case 'mxgraph.flowchart.decision':
                            return 'decision';

                        case 'mxgraph.flowchart.terminator':
                            return 'terminator';

                        default:
                            return undefined;
                    }
                }
            }
        }

        // Style is not set for regular blocks.
        return 'process';
    }
}
