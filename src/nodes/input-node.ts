import BaseNode, { NodeOptions } from "./base-node";
import InputEventTypes from '../config/input-event-types';
import { MidiMessage } from '../config/midi-messages';
import cloneDeep from 'lodash.clonedeep';

export default class InputNode extends BaseNode {

    private deviceId: string;

    constructor(options: NodeOptions, deviceId: string) {
        super(options);
        this.deviceId = deviceId;
    }

    private _handleDeviceRemoved(removedDeviceId: string){
        if (removedDeviceId === this.deviceId){
            this.deviceId = 'nulldevice';
            //TODO: this.events.emit("deviceChanged", this.deviceId);
        }
    }

    public setDeviceId(deviceId: string){
        if (deviceId === this.deviceId) return false;
        
        /**
         * Remove existing listener using this node's ID which should be the same one we
         * used to register the events originally 
         */
        this.midiplex.devices.removeInputEvent(this.deviceId, this.id);

        /**
         * Add new device listener if this node is already active, and assign new reference ID
         */
        this.deviceId = deviceId;
        if (this.active){
            this.midiplex.devices.addInputEvent(this.deviceId, {
                id: this.id, //We use this node's ID so that we have an easy way to remove these events later
                events: InputEventTypes,
                listener: this.receive.bind(this)
            });
        }
        
        this.events.emit("deviceChanged", this);
    }

    public getDeviceId(){
        return this.deviceId;
    }

    public activate(){
        console.log("Node Activated: " + this.id);

        this.midiplex.devices.on("deviceRemoved", this._handleDeviceRemoved.bind(this));
        this.midiplex.devices.addInputEvent(this.deviceId, {
            id: this.id, //We use this node's ID so that we have an easy way to remove these events later
            events: InputEventTypes,
            listener: this.receive.bind(this)
        });

        this.active = true;
    }

    public deactivate(){
        this.midiplex.devices.events.removeListener("deviceRemoved", this._handleDeviceRemoved.bind(this));
        this.midiplex.devices.addInputEvent(this.deviceId, {
            id: this.id,
            events: InputEventTypes,
            listener: this.receive.bind(this)
        });

        this.active = false;
    }

    /**
     * Override parent receive message as the InputNode will only be receiving messages
     * directly from device input events.
     * 
     * @param {Object} message - A WebMidiJS message object
     */
    public receive(message: MidiMessage, receivingEdgeId: string){
        console.log("Received from Device: " + this.id + ":in");

        /**
         * Since the input node is receiving directly from a device event,
         * no receivingEdge is specified. Below simply adds a receiving
         * edge before calling the definition binding to prevent an error.
         */
        super.receive(message, this.id + ":in");
    }

}

