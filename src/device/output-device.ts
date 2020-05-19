import { DeviceStatus } from './device-model';
import MidiMessage from '../config/midi-message';

class OutputDevice {

    //Input Device
    public status: DeviceStatus;
    public portId: string | number;
    static messageBroker;

    //WebMidi
    private webmidi: any;
    private portInstance: any;

    constructor(webmidi: any, portId: string | number){
        this.status = DeviceStatus.DISCONNECTED;
        this.webmidi = webmidi;
        this.portId = portId;
        this.setPort(portId);

        //Call cleanup() to remove these listeners
        this.webmidi.addListener('connected', this.rebindPort.bind(this));
        this.webmidi.addListener('disconnected', this.rebindPort.bind(this));
    }

    public setPort(portId: string | number){
        this.portId = portId;
        this.portInstance = this.webmidi.getOutputById(this.portId);
        this.status = this.portInstance ? DeviceStatus.CONNECTED : DeviceStatus.DISCONNECTED;
    }

    /**
     * Returns true if the MidiMessage is able to be sent, returns false if this device has
     * no resolved portInstance or 
     * 
     * @param message - a MidiMessage to send
     */
    public send(message: MidiMessage, options?: { [key: string]: any }) : boolean {
        if (!typeof OutputDevice.messageBroker[message.type]) return false; //Unrecognized type
        if (!this.portInstance) return false; //No resolved portInstance to send the message

        //console.log("Sending to Output Port: " + this.portId);
        OutputDevice.messageBroker[message.type](this.portInstance, message, options);

        return false;
    }

    /**
     * Called when WebMidi emits a 'connected' or 'disconnected' event to update
     * the status of this devices port.
     */
    private rebindPort(){
        this.setPort(this.portId);
    }

    public cleanup(){
        this.webmidi.removeListener('connected', this.rebindPort.bind(this));
        this.webmidi.removeListener('disconnected', this.rebindPort.bind(this));
    }
}

/**
 * The messageBroker functions determine how a particular message should be sent via
 * the given portInstance object (a WebMidiJS output)
 */
OutputDevice.messageBroker = {
    noteon: function(portInstance: any, message: MidiMessage, options: { [key: string]: any }){
        portInstance.playNote(message.note.number, message.channel, options);
    },
    noteoff: function(portInstance: any, message: MidiMessage, options: { [key: string]: any }){
        portInstance.stopNote(message.note.number, message.channel, options);
    },
    controlchange: function(portInstance: any, message: MidiMessage, options: { [key: string]: any }){
        //console.log(message, options);
        portInstance.sendControlChange(message.controller.number, message.value, message.channel, options);
    },

    sysex: function(portInstance: any, message: MidiMessage, options: { [key: string]: any }){
        console.log("TODO: Handle outgoing messages w/ type=sysex")
    },
    /**
     * This sends a raw message to an output. A raw message should have 
     * type: 'raw' and an array of hex or decimal values, with the first
     * value being the status byte. 
     * 
     * This is probably not stable and is likely to change or be removed in the future
     * as it was carried over from the non-typescript version of MidiPlex and was added
     * to accommodate a niche use case.
     * 
     */
    raw: function(portInstance: any, message: MidiMessage, options: { [key: string]: any }){
        let statusByte = message.data.shift();
        let data = message.data;
        portInstance.send(statusByte, data);
    }
}

export default OutputDevice;

