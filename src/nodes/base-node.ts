import MidiPlex from '../midiplex';
import { InputEdgeOptions, OutputEdgeOptions } from '../definitions/node-definition';
import { InputEdge, OutputEdge, EdgeConnection } from './edges';
import Quantize from '../config/quantize';
import MidiMessage from '../config/midi-message';
import MessageGenerator from './message-generator';
import { ClockEventData } from '../clock/clock-sync';
import EventEmitter from '../util/event-emitter';
import cloneDeep from 'lodash.clonedeep';

import BaseProperty from './properties/base-property';
import Properties from './properties/properties';

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
        options.inputEdges.forEach((inputEdgeConfig) => {
            let input = new InputEdge(this, inputEdgeConfig.name, inputEdgeConfig.receives);
            this.inputEdges.set(input.id, input)
        })

        options.outputEdges.forEach((outputEdgeConfig) => {
            let output = new OutputEdge(this, outputEdgeConfig.name, outputEdgeConfig.sends);
            this.outputEdges.set(output.id, output)
        })

        /**
         * Populate our properties map w/ the properties from the definition file
         */
        for (let name in options.properties){
            let config = options.properties[name];
            this.properties.set(name, new Properties[config.type](config));
        }

        this.tick = this.tick.bind(this);
        this.receive = this.receive.bind(this);
    }

    /**
     * 
     * @param fromEdgeId - The id of this node's edge to connect
     * @param toEdge - An edge
     */
    public to(fromEdgeName: string, toEdge: InputEdge) : EdgeConnection | false {
        /**
         * Validate our connection
         */
        let outputEdge = this.outputEdges.get(this.id + ":" + fromEdgeName);

        switch (true){
            case toEdge.node === this: //Nodes cannot send to their own edges
            case !outputEdge: return false; //The edge doesn't exist on this node
           // case !toEdge.isCompatible(outputEdge): return false; //Edges must have at least one send/receive type in common
            //TODO - IMPORTANT: Add case to check whether a closed loop is formed
        }

        outputEdge.toEdges.set(toEdge.id, toEdge); //Give this node's edge a downstream receiving edge
        toEdge.fromEdges.set(outputEdge.id, outputEdge); //Give the other node's edge an upstream sending edge

        return new EdgeConnection(outputEdge, toEdge);
    }

    public disconnect(fromEdgeId: string, toEdge: InputEdge){
        /**
         * Validate our connection
         */
        let outputEdge = this.outputEdges.get(fromEdgeId);
        if (!outputEdge) return false;

        outputEdge.toEdges.delete(toEdge.id);
        toEdge.fromEdges.delete(outputEdge.id);

        return true;
        //return new EdgeConnection(outputEdge, toEdge);
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
     * Returns the input edge with the given ID if it exists, otherwise returns false
     * 
     * @param edgeId
     */
    public getInputEdge(edgeName: string) : false | InputEdge {
        return this.inputEdges.get(this.id + ":" + edgeName);
    }

    /**
     *  Returns the output edge with the given ID if it exists, otherwise returns false
     * 
     * @param edgeId
     */
    public getOutputEdge(edgeName: string) : false | OutputEdge {
        return this.outputEdges.get(this.id + ":" + edgeName);
    }

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
     * At the moment messages first arrive at an input edge, which calls its parent's receive() method.
     * The parent has no awareness of which edge the message was received from.
     * 
     * TODO: Assess performance of using cloneDeep here
     * 
     * @param message
     * @param receivingEdgeId
     */ 
    public receive(message: MidiMessage, receivingEdgeId: string){
        try {
            this.receiveFunction.apply({
                state: this.definitionState,
                generator: MessageGenerator,
                message: message,
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
     * Internal send function which is exposed to this node's defintion
     * 
     * @param message 
     * @param outputEdgeName 
     */
    _send(message: MidiMessage, outputEdgeName: string) {
        /**
         * Loop through all the downstream edges associated with the given output edge
         * and send the message to each...
         */
        this.outputEdges.get(this.id + ":" + outputEdgeName).toEdges.forEach((edge) => {
            /**
             * TODO: Clonedeep was moved to the receive() function. Does this change behavior at all?
             */
            edge.node.receive(message, edge.id);
        })
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