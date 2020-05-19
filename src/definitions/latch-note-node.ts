import NodeDefinition from './node-definition';
import ReceiveParams from './receive-params';

const LATCH_NOTE_NODE : NodeDefinition = {
    baseType: "filter",
    name: "LATCH_NOTE_NODE",
    description: `
        Catches noteon messages and discards the following noteoff message for that note,
        instead sending a noteoff the next time a noteon is received for the given note.
    `,
    properties: {},
    state: {
        holding: {}
    },
    inputEdges: [
        { name: "in", receives: ["all"] }
    ],
    outputEdges: [
        { name: "latch", sends: ["noteon", "noteoff"] },
        { name: "thru", sends: ["all"] }
    ],
    tick: function(){},
    receive: function(params: ReceiveParams){
        /**
         * Pass through any notes we're not processing
         */
        if (params.message.type !== "noteon" && params.message.type !== "noteoff"){
            params.send(params.message, "thru");
            return;
        }



    }
}

export default LATCH_NOTE_NODE;
