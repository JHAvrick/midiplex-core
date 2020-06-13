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

    /**
     * Connects this edge to an upstream output edge. Returns false if the edge's are not compatible.
     * 
     * @param inputEdge 
     */
    from(outputEdge: OutputEdge) : boolean {
        if (this.node.hasDownstreamNode(outputEdge.node)){
            console.warn("OutputEdge: Attempted to connect an edge which would have created a closed loop/cycle");
            return false;
        }


        if (this.isCompatible(outputEdge)){
            this.fromEdges.set(outputEdge.id, outputEdge);
            outputEdge.toEdges.set(this.id, this);
            return true;
        }
        console.warn("InputEdge: Attempted to connect an incompatible output edge");
        return false;
    }

    public disconnect(outputEdgeId?:string){
        /**
         * Remove ALL edges leading to this one
         */
        if (!outputEdgeId){
            this.fromEdges.forEach((upstream) => upstream.toEdges.delete(this.id));
            this.fromEdges.clear();
            return;
        }

        /**
         * Or remove a single edge if an id was provided
         */
        if (this.fromEdges.has(outputEdgeId)){
            let upstream = this.fromEdges.get(outputEdgeId);
                upstream.toEdges.delete(this.id);
            this.fromEdges.delete(outputEdgeId);
        }
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

    /**
     * Checks whether this edge shares and send types with the given input
     * edge's receiving types (midi message types)
     * 
     * @param inputEdge {InputEdge}
     */
    public isCompatible(inputEdge: InputEdge) {
        switch (true) {
            case this.sendTypes.includes("all"): return true;
            case this.sendTypes.length === 0: return false;
            case inputEdge.receiveTypes.length === 0: return false;
            case inputEdge.receiveTypes.includes("all"): return true;
        }

        for (let i = 0; i < inputEdge.receiveTypes.length; i++){
            if (this.sendTypes.includes(inputEdge.receiveTypes[i]))
                return true;
        }
        
        return false;
    }

    /**
     * Connects this edge to a downstream input edge. Returns false if the edge's are not compatible and
     * returns the destination edge's parent node if the connection is valid (this allows for chaining)
     * 
     * @param inputEdge 
     */
    to(inputEdge: InputEdge) : BaseNode | boolean {
        if (inputEdge.node.hasDownstreamNode(this.node)) {
            console.warn("OutputEdge: Attempted to connect an edge which would have created a closed loop/cycle");
            return false;
        }

        if (this.isCompatible(inputEdge)){
            this.toEdges.set(inputEdge.id, inputEdge);
            inputEdge.fromEdges.set(this.id, this);
            return inputEdge.node;
        }
        console.warn("OutputEdge: Attempted to connect an incompatible input edge");
        return false;
    }

    /**
     * Remove a destination/downstream edge from this edge's collection. Also
     * removes this edge from the destination node's input collection. Calling
     * this method with no arguments will disconnect ALL downstream edges.
     * 
     * @params {string} inputEdgeId - An edge id, which is a string containing both the 
     * parent node's id and the edge name, i.e. <nodeId>:<edgeName>
     * 
     */
    public disconnect(inputEdgeId?:string){
        /**
         * Remove ALL edges downstream from this one
         */
        if (!inputEdgeId){
            this.toEdges.forEach((downstream) => downstream.fromEdges.delete(this.id));
            this.toEdges.clear();
            return;
        }

        if (this.toEdges.has(inputEdgeId)){
            let downstream = this.toEdges.get(inputEdgeId);
                downstream.fromEdges.delete(this.id);
            this.toEdges.delete(inputEdgeId);
        }
    }
}

export { OutputEdge, InputEdge };