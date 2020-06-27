import NodeDefinition from './node-definition';
import ReceiveParams from './receive-params';

const BLANK_NODE : NodeDefinition = {
    name: "INPUT_DEVICE_NODE",
    description: `Receives input from external midi devices and sends all messages thru.`,
    baseType: "input",
    properties: {},
    state: {},
    quantize: false,
    inputEdges: [
        { name: "in", receives: ["all"] }
    ],
    outputEdges: [
        { name: "out", sends: ["all"] }
    ],
    tick: function(){},
    receive: function(params: ReceiveParams, receivingEdge: string){
        params.send(params.message, "out");
    }
}

export default BLANK_NODE;
