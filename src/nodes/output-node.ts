import BaseNode, { NodeOptions } from "./base-node";
import MidiPlex from "../midiplex";
import { MidiMessage } from '../config/midi-messages';

export default class OutputNode extends BaseNode {

    private deviceId: string;

    constructor(options: NodeOptions, deviceId: string){
        super(options);
        this.deviceId = deviceId;
    }

    setDeviceId(deviceId: string){
        this.deviceId = deviceId;
    }

    getDeviceId(){
        return this.deviceId;
    }

    /**
     * The OutputNode overrides the default receive() method, sending the
     * MidiMessage to its device endpoint rather than another node
     */
    public receive(message: MidiMessage, inputEdgeId: string){
        // console.log("Received at Endpoint: " + inputEdgeId);
        // console.log(this.deviceId);
        this.midiplex.devices.send(this.deviceId, message);
    }


    //The active state for this class doesn't actually do anything at the moment
    public activate(){ this.active = true; }
    public deactivate(){ this.active = false; }
}