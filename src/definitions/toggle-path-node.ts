import NodeDefinition from './node-definition';
const TOGGLE_PATH_NODE : NodeDefinition = {
    name: "TOGGLE_PATH_NODE",
    description: `
        This node toggles its output path whenever the control message is receieved. Currently supports
        noteon, noteoff, and controlchange message types.
    `,
    baseType: "filter",
    properties: {
        /**
         * The message type to match - valid values include noteon, noteoff, controlchange
         */
        messageType: {
            type: 'string',
            value: "controlchange"
        },
        /**
         * The note or control change value which, when received, will cause the output edge to switch
         */
        trigger: {
            type: 'number',
            value: 43
        },
    },
    state: {
        /**
         * Holds a reference to the currently open edge
         */
        firstEdgeActive: true
    },
    inputEdges: [{ name: "in", receives: ["all"] }],
    outputEdges: [
        { name: "pathOne", sends: ["all"] },
        { name: "pathTwo", sends: ["all"] }
    ],
    quantize: false,
    tick: function(){},
    receive: function(){
        let messageType : string  = this.prop("messageType");
        let triggerValue : number = this.prop("trigger");
        let receivedValue : number = this.message.value ?? this.message?.note?.number;

        if (this.message.type === messageType && triggerValue === receivedValue)
            this.state.firstEdgeActive = !this.state.firstEdgeActive;
        

        this.send(this.message, this.state.firstEdgeActive ? "edgeOne" : "edgeTwo");
    }
}

export default TOGGLE_PATH_NODE;
