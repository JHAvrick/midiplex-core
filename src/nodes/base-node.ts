import MidiPlex from '../midiplex';
import { InputEdgeOptions, OutputEdgeOptions } from '../definitions/node-definition';
import { InputEdge, OutputEdge } from './edges';
import Quantize from '../config/quantize';
import MessageGenerator from './message-generator';
import { ClockEventData } from '../clock/clock-sync';
import EventEmitter from '../util/event-emitter';
import cloneDeep from 'lodash.clonedeep';
import BaseProperty from './properties/base-property';
import Properties from './properties/properties';
import { MidiMessage } from '../config/midi-messages';

/**
 * The NodeOptions interface should represent the reconciliation of two other objects
 * implementing NodeDefinition and NodeConfig respectively. This reconciliation is 
 * performed at the graph-level. The NodeOptions object must also importantly contain
 * an id string and a reference to master global MidiPlex object.
 * 
 */
interface NodeOptions {
    id: string,
    midiplex: MidiPlex,
    tick: Function,
    receive: Function,
    name: string,
    description: string,
    state: any,
    properties: { [key: string]: any },
    inputEdges: Array<InputEdgeOptions>,
    outputEdges: Array<OutputEdgeOptions>,
    deviceId?: string | number, //Only matters for an InputNode,
    quantize?: string | false,
    //TODO: What else do we need here?
}

export default abstract class BaseNode {

    public id: string;
    public events: EventEmitter;
    protected active: boolean;
    protected midiplex: MidiPlex;
    protected inputEdges: Map<string, InputEdge>;
    protected outputEdges: Map<string, OutputEdge>;
    protected properties: Map<string, BaseProperty>;
    protected receiveFunction : any;
    protected tickFunction : any;
    protected definitionState: any;
    protected _quantize?: string | false;

    constructor(options: NodeOptions) {
        this.id = options.id;
        this.events = new EventEmitter();
        this.midiplex = options.midiplex;
        this.inputEdges = new Map<string, InputEdge>();
        this.outputEdges = new Map<string, OutputEdge>();
        this._quantize = options.quantize;

        //Definition Bindings
        this.properties = new Map<string, BaseProperty>();
        this.receiveFunction = options.receive;
        this.tickFunction = options.tick;
        this.definitionState = options.state;
       
        /**
         * Populate our input and output edges based on the given config
         */
        options.inputEdges.forEach((options) => this.addInputEdge(options.name, options.receives));
        options.outputEdges.forEach((options) => this.addOutputEdge(options.name, options.sends));

        /**
         * Populate our properties map w/ the properties from the definition file
         */
        for (let name in options.properties){
            let config = options.properties[name];
            this.properties.set(name, new Properties[config.type](config));
        }

        /**
         * Make sure our tick function is always called in context
         */
        this.tick = this.tick.bind(this);
    }

    /**
     * Returns an output edge with the  given name
     * 
     * @param name {string}
     */
    public out(name) : OutputEdge {
        return this.outputEdges.get(name);
    }

    /**
     * Returns an input edge with the given name
     * 
     * @param name {string}
     */
    public in(name) : InputEdge {
        return this.inputEdges.get(name);
    }


    /**
     * Add a new output edge to this node
     * 
     * @param outputEdgeConfig 
     */
    public addOutputEdge(name : string, sends: Array<string> ) : OutputEdge {
        if (!this.outputEdges.has(name)){
            let outputEdge = new OutputEdge(this, name, sends);
            this.outputEdges.set(name, outputEdge);
            this.events.emit("outputEdgeAdded", outputEdge);
            return outputEdge;
        }

        console.warn("BaseNode: An output edge with the given name already exists");
        return;
    }

    /**
     * Create a new input edge on this node
     * 
     * @param outputEdgeConfig 
     */
    public addInputEdge(name : string, receives: Array<string> ) : InputEdge {
        if (!this.inputEdges.has(name)){
            let inputEdge = new InputEdge(this, name, receives);
            this.inputEdges.set(name, inputEdge);
            this.events.emit("inputEdgeAdded", inputEdge);
            return inputEdge;
        }

        console.warn("BaseNode: An input edge with the given name already exists");
        return;
    }

    /**
     * Completely removes one of this node's edges, disconnecting any 
     * 
     * @param name - name of the edge
     */
    public removeInputEdge(name:string){
        if (this.inputEdges.has(name)){
            this.inputEdges.get(name).disconnect();
            this.inputEdges.delete(name);
            this.events.emit("inputEdgeRemoved", name);
        }
    }

    /**
     * Completely removes one of this node's edges, disconnecting any 
     * 
     * @param name - name of the edge
     */
    public removeOutputEdge(name:string){
        if (this.outputEdges.has(name)){
            this.outputEdges.get(name).disconnect();
            this.outputEdges.delete(name);
            this.events.emit("outputEdgeRemoved", name);
        }
    }

    /**
     * Checks whether this node has another node anywhere downstream. Used to 
     * check whether a connection will cause a closed loop.
     * 
     * TODO: There is probably a more traditional and optimized way to perform this check. 
     * See https://www.geeksforgeeks.org/detect-cycle-undirected-graph/
     * 
     * @param node - a potential downstream node
     */
    public hasDownstreamNode(node: BaseNode){
        if (node === this) return true;

        let outputEdges = Array.from(this.outputEdges.values());
        for (let i = 0; i < outputEdges.length; i++){

            let toEdges = Array.from(outputEdges[i].toEdges.values());
            for (let x = 0; x < toEdges.length; x++){
                if (toEdges[i].node === node) return true;
                if (toEdges[i].node.hasDownstreamNode(node)) return true;
            }

        }

        return false;

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

    /**
     * Get or set the quantize value
     * 
     * @param value {string} 
     */
    public quantize(value?: string){
        if (!value) return this._quantize;
        else this._applyQuantize(value);
    }

    /**
     * Get or set a property. This method is exposed to the definition functions as well
     * as public facing api.
     */
    public property(name:string, value?:any){
        let prop = this.properties.get(name);
        if (value === undefined) {
            return prop.value;
        } else {
            prop.value = value;
            this.events.emit("propertyChange", name, value);
        }
    }

    /**
     * Callback function used by midiplex.clock when this node has a quantize value.
     * 
     * TODO: Some potential optimizations might include not rebuilding the tick function's
     * context everytime this function is called and removing the cloneDeep function.
     * 
     * @param clockEventData - Clock data as provided by 
     */
    public tick(clockEventData : ClockEventData){
        try {
            this.tickFunction.apply({
                state: this.definitionState,
                generator: MessageGenerator,
                data: cloneDeep(clockEventData),
                quantize: (value: string) => this.quantize(value),
                prop: (name : string, value : any) => this.property(name, value),
                send: (message: MidiMessage, outputEdgeName: string) => this._send(message, outputEdgeName)
            })
        } catch (err){
            this.events.emit("error", err);
        }
    }

    /**
     * Applies quantize state
     * 
     * @param value - The qauntize value or false to remove quantize
     */
    private _applyQuantize(value : string | false) {
        //If a valid quantize value was given
        if (value && Quantize[value] !== undefined){
            //Remove existing listener
            if (this._quantize){
                this.midiplex.clock.events.removeListener("start", this.tick);
                this.midiplex.clock.events.removeListener("stop", this.tick);
                this.midiplex.clock.events.removeListener(this._quantize, this.tick);
            }
            
            this._quantize = value;
            this.midiplex.clock.events.on("start", this.tick);
            this.midiplex.clock.events.on("stop", this.tick);
            this.midiplex.clock.events.on(this._quantize, this.tick);
            return;
        }

        //If false was given, just remove our quantize
        if (!value && this._quantize){
            this.midiplex.clock.events.removeListener(this._quantize, this.tick); 
        }

        this._quantize = false;
        return;
    }

    /**
     * Internal send function which is exposed to this node's defintion. If the definition attempts to 
     * send to an edge that doesn't exist, thing will happen.
     * 
     * @param message 
     * @param outputEdgeName 
     */
    private _send(message: MidiMessage, outputEdgeName: string) {
        /**
         * Loop through all the downstream edges associated with the given output edge
         * and send the message to each...
         */
        this.outputEdges.get(outputEdgeName)?.toEdges.forEach((edge) => {
            /**
             * TODO: Clonedeep was moved to the receive() function. Does this change behavior at all?
             */
            edge.node.receive(message, edge.name);
        })
    }

    /**
     * At the moment messages first arrive at an input edge, which calls its parent's receive() method.
     * The parent has no awareness of which edge the message was received from.
     * 
     * TODO: Assess performance of using cloneDeep here
     * 
     * @param message
     * @param receivingEdgeId
     */ 
    public receive(message: MidiMessage, receivingEdgeName: string){
        try {
            this.receiveFunction.apply({
                state: this.definitionState,
                receivingEdge: receivingEdgeName,
                generator: MessageGenerator,
                message: message,
                inputEdges: Array.from(this.inputEdges.entries()).map((entry) => { return { name: entry[0], receives: entry[1].receiveTypes }}),
                outputEdges: Array.from(this.outputEdges.entries()).map((entry) => { return { name: entry[0], receives: entry[1].sendTypes }}),
                quantize: (value: string) => this.quantize(value),
                prop: (name : string, value : any) => this.property(name, value),
                send: (message: MidiMessage, outputEdgeName: string) => this._send(message, outputEdgeName),
            })
        } catch (err){
            this.events.emit("error", err);
        }
    }

    public activate(){
        /**
         * Adds our quantize events and initializes this._quantize
         */
        this._applyQuantize(this._quantize);
    }

    public deactivate(){
        /**
         * Remove our quantize event
         */
        this._applyQuantize(false);
    }

}

export { NodeOptions };