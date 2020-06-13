import NodeDefinition from './node-definition';
const DEBUG_NODE : NodeDefinition = {
    name: "DEBUG_NODE",
    description: ``,
    baseType: "filter",
    properties: {},
    state: {},
    inputEdges: [{ name: "in", receives: ["all"] }],
    outputEdges: [{ name: "thru", sends: ["all"] }],
    quantize: false,
    tick: function(){},
    receive: function(){
        console.log(this.message);
        this.send(this.message, "thru");
    }
}

export default DEBUG_NODE;
