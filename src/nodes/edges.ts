import BaseNode from './base-node';

class InputEdge {

    public id: string; //The edge reference id
    public name: string;
    public node: BaseNode; //The node to which this edge belongs
    public fromEdges: Map<string, OutputEdge>; //References to the upstream edges leading to this one
    public receiveTypes: Array<string>;

    constructor(node: BaseNode, name: string, receiveTypes: Array<string>){
        this.id = node.id + ":" + name; //An edge's ID is a combination of the node id and the egde's name
        this.name = name;
        this.node = node;
        this.receiveTypes = receiveTypes;
        this.fromEdges = new Map<string, OutputEdge>();
    }

    public isCompatible(outputEdge: OutputEdge) {
        switch (true) {
            case outputEdge.sendTypes.length === 0: return false;
            case this.receiveTypes.length === 0: return false;
            case outputEdge.sendTypes.includes("all"): return true;
        }

        for (let i = 0; i < outputEdge.sendTypes.length; i++){
            if (this.receiveTypes.includes(outputEdge.sendTypes[i]))
                return true;
        }

        return false;
    }
}

class OutputEdge {
    public id: string;
    public name: string;
    public node: BaseNode;
    public toEdges: Map<string, InputEdge>;
    public sendTypes: Array<string>;

    constructor(node: BaseNode, name: string, sendTypes: Array<string>){
        this.id = node.id + ":" + name; //An edge's ID is a combination of the node id and the egde's name
        this.name = name;
        this.node = node;
        this.sendTypes = sendTypes;
        this.toEdges = new Map<string, InputEdge>();
    }

    public isCompatible(inputEdge: InputEdge) {
        switch (true) {
            case inputEdge.receiveTypes.length === 0: return false;
            case this.sendTypes.length === 0: return false;
            case inputEdge.receiveTypes.includes("all"): return true;
        }

        for (let i = 0; i < inputEdge.receiveTypes.length; i++){
            if (this.sendTypes.includes(inputEdge.receiveTypes[i]))
                return true;
        }
        
        return false;
    }
}

class EdgeConnection {
    public input: InputEdge;
    public output: OutputEdge;
    private _connected: boolean;
    constructor(output: OutputEdge, input: InputEdge){
        this.output = output;
        this.input = input;
        this._connected = true;
        output.toEdges.set(input.id, input); 
        input.fromEdges.set(output.id, output); 
    }

    get connected(): boolean{
        return this._connected;
    }

    public disconnect(){
        this.output.toEdges.delete(this.input.id);
        this.input.fromEdges.delete(this.output.id);
        this._connected = false;
    }
}




// class OutputEdge {

//     public key: string;
//     public sendTypes: Array<string>;
//     public outputs: Map<string, InputEdge>;

//     constructor(parentNode: BaseNode, key:string, sendTypes:Array<string>){
//         this.key = key;
//         this.sendTypes = sendTypes;
//         this.outputs = new Map<string, InputEdge>();
//     }

//     /**
//      * Sends a message to all of this edge's outputs
//      * 
//      * @param message - A midi message object
//      */
//     send(message: MidiMessage){
//         this.outputs.forEach((inputEdge) => {
//             inputEdge.receive(message);
//         });
//     }

//     to(input: InputEdge): boolean {
//         /**
//          * TODO: Validate connection and return false if the connection is illegal
//          *  - Cannot go to own edges
//          *  - Cannot form loop (traverse tree and make sure no downstream edge connects to one of this edge's inputs)
//          *  - Log a console warning if a closed loop is attempted
//          */
//         this.outputs.set(input.key, input);
//         input.inputs.set(this.key, this); //Add 
//         return true;
//     }

//     disconnect(key: string): boolean {
//         return this.outputs.delete(key);
//     }
    
// }



// class InputEdge {

//     private parentNode: BaseNode;
//     public key: string;
//     public receiveTypes: Array<string>;
//     public inputs: Map<string, OutputEdge>;

//     constructor(parentNode: BaseNode, key:string, receiveTypes:Array<string>){
//         this.key = key;
//         this.receiveTypes = receiveTypes;
//         this.inputs = new Map<string, OutputEdge>();
//     }

//     /**
//      * This function adds an edge to this edge's inputs map WITHOUT adding itself to the
//      * given edge's own map. In other words, this function establishes a ONE-WAY connection
//      * between two nodes.
//      */
//     addEdgeToInputs(output: OutputEdge){
//         this.inputs.set(output.key, output);
//     }

//     from(output: OutputEdge): boolean {
//         /**
//          * TODO: Validate connection and return false if the connection is illegal
//          *  - Cannot go to own edges
//          *  - Cannot form loop (traverse tree and make sure no downstream edge connects to one of this edge's inputs)
//          *  - Log a console warning if a closed loop is attempted
//          */
//         this.outputs.set(input.key, input);
//         return true;
//     }

//     receive(message: MidiMessage){
//         //TODO: Check first if the message is of the correct type
//         this.parentNode.receive(message);
//     }

//     disconnect(key: string): boolean {
//         return this.inputs.delete(key);
//     }

// }


// interface IEdge {
//     id: string,
//     outputEdges: Array<{}>,
//     receiveTypes: []
// }

export { OutputEdge, InputEdge, EdgeConnection };