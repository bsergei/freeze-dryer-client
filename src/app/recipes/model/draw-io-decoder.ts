import * as pako from 'pako';

export class DrawIoDecoder {
    public decodeToMxGraph(drawIoXml: string) {
        const node = this.parseXml(drawIoXml).documentElement;

        if (node != null && node.nodeName === 'mxfile') {
            const diagrams = node.getElementsByTagName('diagram');
            if (diagrams.length > 0) {
                const diagram0 = diagrams[0];
                return this.decodeDiagram(diagram0);
            }
        }
    }

    public decodeToMxGraphAsXml(drawIoXml: string) {
        const result = this.decodeToMxGraph(drawIoXml);
        const parser = new DOMParser();
        return parser.parseFromString(result, 'text/xml');
    }

    private decodeDiagram(diagram: Element) {
        const diagramTextContent = this.getTextContent(diagram);
        const diagramDecode = atob(diagramTextContent);
        const zlibDecoded: Uint8Array = pako.inflateRaw(diagramDecode);
        const uriEncoded = this.bytesToString(zlibDecoded);
        const decoded = decodeURIComponent(uriEncoded);
        return decoded;
    }

    private parseXml(xml: string) {
        const parser = new DOMParser();
        return parser.parseFromString(xml, 'text/xml');
    }

    private getTextContent(node: Element) {
        return (node != null) ? node[(node.textContent === undefined) ? 'text' : 'textContent'] : '';
    }

    private bytesToString(arr: Uint8Array) {
        let str = '';
        for (let i = 0; i < arr.length; i++) {
            str += String.fromCharCode(arr[i]);
        }

        return str;
    }
}
