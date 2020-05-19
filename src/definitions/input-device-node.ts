import NodeDefinition from './node-definition';
import ReceiveParams from './receive-params';

const INPUT_DEVICE_NODE : NodeDefinition = {
    name: "INPUT_DEVICE_NODE",
    description: `Receives input from external midi devices and sends all messages thru.`,
    baseType: "input",
    properties: {},
    state: {},
    inputEdges: [{ name: "in", receives: ["all"] }],
    outputEdges: [{ name: "out", sends: ["all"] }],
    quantize: false,
    tick: function(){},
    receive: function(){
        /**
         * Simple sends any received messges to the "out" edge
         */
        //params.send(params.message, "out");
        this.send(this.message, "out");
    }
}

export default INPUT_DEVICE_NODE;
