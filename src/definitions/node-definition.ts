export default interface NodeDefinition {
    name: string;
    description: string;
    baseType: string;
    inputEdges: Array<InputEdgeOptions>;
    outputEdges: Array<OutputEdgeOptions>;
    properties: { [key: string]: any };
    state: { [key: string]: any },
    quantize: string | false,
    tick: Function;
    receive: Function;
}

interface InputEdgeOptions {
    name: string,
    receives: Array<string>,
}

interface OutputEdgeOptions {
    name: string,
    sends: Array<string>,
}

export { InputEdgeOptions, OutputEdgeOptions };
