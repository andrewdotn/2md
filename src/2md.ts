import { JSDOM} from "jsdom";

abstract class IlNode {
    constructor(children: (IlNode | string)[]) {
        this.children = children;
    }
    children: (IlNode | string)[]
}

export class Doc extends IlNode {};
export class H extends IlNode {};
export class A extends IlNode {
    constructor(children: (IlNode | string)[], {href}: {href: string}) {
        super(children);
        this.href = href;
    }
    href: string
};
export class B extends IlNode {};
export class P extends IlNode {};
export class L extends IlNode {};

export function parse(html: string): IlNode {
    return new Doc([]);
}

function walk(accum: [string], node: Node) {
    if (node.nodeType == node.TEXT_NODE) {
        accum[0] += node.textContent;
    } else if (node.nodeType == node.ELEMENT_NODE) {
        console.log(node.nodeName);

        for (let i = 0; i< node.childNodes.length; i++) {
            const c = node.childNodes[i];
            walk(accum, c);
        }
    }
}

export function toMd(html: string): string {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    let ret: [string] = [''];
    for (let i = 0; i < doc.childNodes.length; i++) {
        walk(ret, doc.childNodes[i]);
    }

    return ret[0];
}
