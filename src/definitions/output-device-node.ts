import NodeDefinition from './node-definition';
import ReceiveParams from './receive-params';

const OUTPUT_DEVICE_NODE : NodeDefinition = {
    name: "OUTPUT_DEVICE_NODE",
    description: `Device endpoint, sends all messages thru to external device.`,
    baseType: "output",
    state: {},
    properties: {},
    outputEdges: [],
    inputEdges: [
        { name: "in", receives: ["all"] }
    ],
    quantize: false,
    tick: function(){},
    receive: function(){}
}

export default OUTPUT_DEVICE_NODE;