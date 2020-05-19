import MidiPlex from '../midiplex';
import { InputEdgeOptions, OutputEdgeOptions } from '../definitions/node-definition';
import { InputEdge, OutputEdge, EdgeConnection } from './edges';
import Quantize from '../config/quantize';
import NodeProperties from './node-properties';
import MidiMessage from '../config/midi-message';
import MessageGenerator from './message-generator';
import { ClockEventData } from '../clock/clock-sync';
import EventEmitter from '../util/event-emitter';
import cloneDeep from 'lodash.clonedeep';

/**
 * The NodeOptions interface should represent the reconciliation of two other objects
 * implementing NodeDefinition and NodeConfig respectively. This reconciliation is 
 * performed at the graph-level. The NodeOptions object must also importantly contain
 * an id string and a reference to master global MidiPlex object.
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
    protected receiveFunction : any;
    protected tickFunction : any;
    protected properties: NodeProperties;
    protected definitionState: any;
    protected quantize?: string | false;

    constructor(options: NodeOptions) {
        this.id = options.id;
        this.events = new EventEmitter();
        this.midiplex = options.midiplex;
        this.inputEdges = new Map<string, InputEdge>();
        this.outputEdges = new Map<string, OutputEdge>();
        this.quantize = options.quantize;

        //Definition Bindings
        this.properties = new NodeProperties();
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
         * Add all our properties
         */
        //this.properties.addProperty
                //TODO: apply properties, etc
        // Object.defineProperty(this.tickFunction, "quantize", {
        //     get: () => this.quantize,
        //     set: (val) => { this._applyQuantize(val); console.log(">>>>>>>>>") }
        // });


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

    public tick(clockEventData : ClockEventData){

        let quantize = this.quantize;
        let applyQuantize = this._applyQuantize.bind(this);
        let tick = this.tickFunction.bind({
            state: this.definitionState,
            generator: MessageGenerator,
            data: clockEventData,
            get quantize() { return quantize },
            set quantize(val) { applyQuantize(val); console.log(">>>>>>>>>"); },
            send: (message: MidiMessage, outputEdgeName: string) => {
                /**
                 * Loop through all the downstream edges associated with the given output edge
                 * and send the message to each...
                 */
                this.outputEdges.get(this.id + ":" + outputEdgeName).toEdges.forEach((edge) => {
                    /**
                     * TODO: Assess the performance impact of using cloneDeep here
                     * and consider an alternate method
                     */
                    edge.node.receive(cloneDeep(message), edge.id);
                })
            }
        }); 

        // Object.defineProperty(tick, "quantize", {
        //     get: () => this.quantize,
        //     set: (val) => { this._applyQuantize(val); console.log(">>>>>>>>>"); }
        // });

        //console.log(tick.quantize);

        // // console.log(tick);
        // tick.call({
        //     state: this.definitionState,
        //     generator: MessageGenerator,
        //     data: clockEventData,
        //     send: (message: MidiMessage, outputEdgeName: string) => {
        //         /**
        //          * Loop through all the downstream edges associated with the given output edge
        //          * and send the message to each...
        //          */
        //         this.outputEdges.get(this.id + ":" + outputEdgeName).toEdges.forEach((edge) => {
        //             /**
        //              * TODO: Assess the performance impact of using cloneDeep here
        //              * and consider an alternate method
        //              */
        //             edge.node.receive(cloneDeep(message), edge.id);
        //         })
        //     }
        // })

        tick();
    }


    /**
     * At the moment messages first arrive at an input edge, which calls its parent's receive() method.
     * The parent has no awareness of which edge the message was received from.
     * 
     * @param message 
     * @param receivingEdgeId
     */ 
    public receive(message: MidiMessage, receivingEdgeId: string){
        try {
            
            let receive = new this.receiveFunction();
                //Loop through properties and add getters/setters
                Object.defineProperty(receive, "quantize", {
                    get: () => this.quantize,
                    set: (val) => this._applyQuantize(val) 
                });

                receive.call({
                    receivingEdge: receivingEdgeId.split(":")[1],
                    message: message,
                    state: this.definitionState,
                    generator: MessageGenerator,
                    send: (message: MidiMessage, outputEdgeName: string) => {
                        /**
                         * Loop through all the downstream edges associated with the given output edge
                         * and send the message to each...
                         */
                        this.outputEdges.get(this.id + ":" + outputEdgeName).toEdges.forEach((edge) => {
                            /**
                             * TODO: Assess the performance impact of using cloneDeep here
                             * and consider an alternate method
                             */
                            edge.node.receive(cloneDeep(message), edge.id);
                        })
                    }
                })


            // //Call the receive() function from our NodeDefinition
            // this.receiveBinding({
            //     receivingEdge: receivingEdgeId.split(":")[1], //Get just the name portion of the edgeId
            //     message: message,

            //     generate: (messageType: string) => {
            //         //TODO: ???
            //     },

            //     setProperty: (propertyName: string, value: any) => {
            //         //TODO: How to set properties in this direction??
            //     },

            //     getProperty: (propertyName: string) => {
            //         return this.properties.getProperty(propertyName);
            //     },
                
            //     //Fuction which can be used to send 
            //     send: (message: MidiMessage, outputEdgeName: string) => {
            //         /**
            //          * Loop through all the downstream edges associated with the given output edge
            //          * and send the message to each...
            //          */
            //         this.outputEdges.get(this.id + ":" + outputEdgeName).toEdges.forEach((edge) => {
            //             /**
            //              * TODO: Assess the performance impact of using cloneDeep here
            //              * and consider an alternate method
            //              */
            //             edge.node.receive(cloneDeep(message), edge.id);
            //         })
            //     }

            // });

        } catch (err) {
            throw err;
            this.events.emit("error", err);
        }
    }

    /**
     * Applies quantize state
     * 
     * @param value - The qauntize value or false to remove quantize
     */
    private _applyQuantize(value : string | false) {

        console.log("Apply quantize!");

        //If a valid quantize value was given
        if (value && Quantize[value] !== undefined){
            //Remove existing listener
            if (this.quantize){
                this.midiplex.clock.events.removeListener("start", this.tick);
                this.midiplex.clock.events.removeListener("stop", this.tick);
                this.midiplex.clock.events.removeListener(this.quantize, this.tick);
            }
            
            this.quantize = value;
            this.midiplex.clock.events.on("start", this.tick);
            this.midiplex.clock.events.on("stop", this.tick);
            this.midiplex.clock.events.on(this.quantize, this.tick);
            return;
        }

        //If false was given, just remove our quantize
        if (!value && this.quantize){
            this.midiplex.clock.events.removeListener(this.quantize, this.tick); 
        }

        this.quantize = false;
        return;
    }

    public activate(){
        /**
         * Adds our quantize events and initializes this.quantize
         */
        this._applyQuantize(this.quantize);
    }

    public deactivate(){
        /**
         * Remove our quantize event
         */
        this._applyQuantize(false);
    }

}

export { NodeOptions };