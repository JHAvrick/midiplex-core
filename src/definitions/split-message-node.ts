import NodeDefinition from './node-definition';
const SPLIT_MESSAGE_NODE : NodeDefinition = {
    name: "SPLIT_MESSAGE_NODE",
    description: `This node routes each MIDI message type received to its own edge edge.`,
    baseType: "filter",
    properties: {},
    state: {},
    inputEdges: [
        { name: "in", receives: ["all"] }
    ],
    outputEdges: [{ name: "out", sends: ["all"] }],
    quantize: "1/16",
    tick: function(){

        console.log(this.quantize());
        console.log(this.prop("list"));

        if (this.state.first){
            setTimeout(() => {
                this.prop("list", [5, 6, 7, 8]);
                this.quantize("1/8");
            }, 3000);
            this.state.first = false;
        }


        if (this.data.type === "stop"){
            this.send(this.generator.noteoff("C4"), "out");
            return;
        }

        
        this.send(this.generator.noteon("C4"), "out");
        setTimeout(() => this.send(this.generator.noteoff("C4"), "out"), 10)
    },
    receive: function(){
        /**
         * Simple sends any received messges to the "out" edge
         */
        //params.send(params.message, "out");
        //this.send(this.generator.noteon("C4"), "out");

        this.send(this.message, "out");
    }
}

export default CLOCK_TEST_NODE;
