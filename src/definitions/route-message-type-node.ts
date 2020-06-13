import NodeDefinition from './node-definition';
const ROUTE_MESSAGE_TYPE_NODE : NodeDefinition = {
    name: "ROUTE_MESSAGE_TYPE_NODE",
    description: `
        This node routes each MIDI message type received to an edge w/ the same name. Add
        an edge with the name of a midi message type to route all message of that type
        through the edge.
    `,
    baseType: "filter",
    properties: {},
    state: {},
    inputEdges: [{ name: "in", receives: ["all"] }],
    outputEdges: [{ name: "thru", sends: ["all"] }],
    quantize: false,
    tick: function(){},
    receive: function(){
        /**
         * This node simply sends each message type to an edge w/ the corresponding name,
         * regardless of whether that edge exists or not. All message types are send to
         * the `thru` edge.
         */
        this.send(this.message, this.message.type);
        this.send(this.message, "thru");
    }
}

export default ROUTE_MESSAGE_TYPE_NODE;
