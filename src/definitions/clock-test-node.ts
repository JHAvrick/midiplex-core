import NodeDefinition from './node-definition';
const CLOCK_TEST_NODE : NodeDefinition = {
    name: "CLOCK_TEST_NODE",
    description: `Test node for the internal clock sync.`,
    baseType: "filter",
    properties: {},
    state: {
        first: true
    },
    inputEdges: [{ name: "in", receives: ["all"] }],
    outputEdges: [{ name: "out", sends: ["all"] }],
    quantize: "1/16",
    tick: function(){
        //console.log("Tick!");

        if (this.state.first){
            console.log("FIRST!");
            console.log(this.quantize);
            setTimeout(() => {this.quantize = "1/8"; console.log("Triggered!")}, 3000);
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
