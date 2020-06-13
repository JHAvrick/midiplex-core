import MidiPlex from '../midiplex';
import NodeDefinition from '../definitions/node-definition';
import BaseNode, { NodeOptions } from '../nodes/base-node';
import { InputEdge, OutputEdge } from '../nodes/edges';
import Nodes from '../nodes/nodes';
import shortid from 'shortid';
import NodeConfig from '../config/node-config';
import EventEmitter from '../util/event-emitter';

class MidiPlexGraph {

    public readonly id: string;
    public events: EventEmitter;
    private midiplex: MidiPlex;
    private nodes: Map<string, BaseNode>;

    constructor(midiplex: MidiPlex, id: string){
        this.id = id;
        this.midiplex = midiplex;
        this.events = new EventEmitter();
        this.nodes = new Map<string, BaseNode>();
    }

    /**
     * Shorthand wrapper function for this.events.on()
     * 
     * @param event 
     * @param listener 
     */
    public on(event: string, listener: Function){
        this.events.on(event, listener);
    }

    public addNode(definition: NodeDefinition, config: NodeConfig = {}) : BaseNode | false {
        if (config.id && this.nodes.has(config.id)) {
            console.warn("Attempted to add a node with an ID that is already in use. Nodes must have a unique ID.")
            return
        }  

        if (!definition){
            console.warn("Graph: Cannot create node as no definition was provided");
            return;
        }


        //Get our node class
        let NodeClass = Nodes[definition.baseType];
        if (!NodeClass) return false;

        //TODO: Add config reconciliation maybe
        let options : NodeOptions = {
            id: config.id || shortid.generate(),
            midiplex: this.midiplex,
            name: definition.name,
            description: definition.description,
            tick: definition.tick,
            receive: definition.receive,
            inputEdges: definition.inputEdges,
            outputEdges: definition.outputEdges,
            state: definition.state,
            properties: definition.properties,
            deviceId: config.deviceId,
            quantize: definition.quantize
        }

        let node = new NodeClass(options);
        this.nodes.set(options.id, node);
        this.events.emit("nodeAdded", node.id);

        return node;
    }

    public removeNode(nodeId: string){
        let node = this.nodes.get(nodeId);
        if (!node) return;

        //TODO - IMPORTANT: Disconnect node's edges from all other edges
        this.nodes.delete(nodeId);
        this.events.emit("nodeRemoved", nodeId);
    }

    // /**
    //  * Edges can be connected either by providing the actual edge instance or the node/edge keys
    //  * 
    //  * @param from - The sending edge
    //  * @param to - The receiving edge
    //  */
    // public connectEdges(from: OutputEdge, to: InputEdge) : EdgeConnection | false;
    // public connectEdges(from: {nodeId: string, edgeId: string}, to: {nodeId: string, edgeId: string}) : EdgeConnection | false;
    // public connectEdges(from: any, to:any) : EdgeConnection | false {
    //     let fromEdge = from instanceof OutputEdge ? from : this.getOutputEdge(from.nodeId, from.edgeId);
    //     let toEdge = to instanceof InputEdge ?  to : this.getInputEdge(to.nodeId, to.edgeId);
    //     if (!fromEdge || !toEdge) return false;

    //     return fromEdge.node.to(fromEdge.id, toEdge);
    // }

    // /**
    //  * Edges can be connected either by providing the actual edge instance or the node/edge keys
    //  * 
    //  * @param from - The sending edge
    //  * @param to - The receiving edge
    //  */
    // public disconnectEdges(from: OutputEdge, to: InputEdge) : boolean;
    // public disconnectEdges(from: {nodeId: string, edgeId: string}, to: {nodeId: string, edgeId: string}) : boolean;
    // public disconnectEdges(from: any, to: any) : boolean {
    //     let fromEdge = from instanceof OutputEdge ? from : this.getOutputEdge(from.nodeId, from.edgeId);
    //     let toEdge = to instanceof InputEdge ?  to : this.getInputEdge(to.nodeId, to.edgeId);
    //     if (!fromEdge || !toEdge) return false;



    //     //return fromEdge.node.to(fromEdge.id, toEdge);
    // }

    // public getInputEdge(nodeId : string, edgeId : string) : false | InputEdge {
    //     let node = this.nodes.get(nodeId);
    //     if (!node) return false;
    //     return node.getInputEdge(edgeId);
    // }

    // public getOutputEdge(nodeId : string, edgeId : string) : false | OutputEdge {
    //     let node = this.nodes.get(nodeId);
    //     if (!node) return false;
    //     return node.getOutputEdge(edgeId);
    // }

    public activate(){
        this.nodes.forEach((node) => node.activate());
    }

    public deactivate(){
        this.nodes.forEach((node) => node.deactivate());
    }


}

export default MidiPlexGraph;