import EventEmitter from "../util/event-emitter";
import { DeviceOptions, DeviceEvent, DeviceStatus } from './device-model';
import MidiDevice from './midi-device';
import MidiMessage from "../config/midi-message";

export default class DeviceManager {

    public events: EventEmitter;
    private webmidi: any;
    private devices: Map<string, MidiDevice>;
    private initialDeviceConfigs: Array<DeviceOptions>;
    
    constructor(WebMidi: any,  devices: Array<DeviceOptions> = []){
        this.events = new EventEmitter();
        this.webmidi = WebMidi;
        this.initialDeviceConfigs = devices;
        this.devices = new Map<string, MidiDevice>();

        /**
         * Add our devices to our device map so we can easily reference them
         */
        devices.forEach((deviceOptions) => {
            this.devices.set(deviceOptions.id, new MidiDevice(this.webmidi, deviceOptions));
        });

        this.webmidi.addListener('connected', this.handlePortsConnected.bind(this));
        this.webmidi.addListener('disconnected', this.handlePortsDisconnected.bind(this));
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

    public addDevice(options: DeviceOptions) : MidiDevice | false {
        let deviceOptions = Object.assign({}, options);

        //Do not allow overwriting devices
        if (this.devices.has(deviceOptions.id)){
            console.warn(`DeviceManager: Attempted to add a device with an id that is already in use.`)
            return false;
        }

        //Check if the provided input or output ports are already being used
        if (this.portInUse(deviceOptions.webmidi.inputId)){
            deviceOptions.webmidi.inputId = null;
            console.warn(`DeviceManager: Attempted to add a device w/ an input port that is already being used - input port set to null.`)
        }

        if (this.portInUse(deviceOptions.webmidi.outputId)){
            deviceOptions.webmidi.outputId = null;
            console.warn(`DeviceManager: Attempted to add a device w/ an output port that is already being used - output port set to null.`)
        }

        let newDevice = new MidiDevice(this.webmidi, deviceOptions);

        this.devices.set(deviceOptions.id, newDevice);
        this.events.emit("deviceAdded");

        return newDevice;
    }

    public removeDevice(deviceId: string) : string | false {
        let device = this.devices.get(deviceId);
        if (!device) return false;

        device.cleanup();
        this.devices.delete(deviceId);
        this.events.emit("deviceRemoved", deviceId);
    }


    private handlePortsConnected(){ 
        this.events.emit("portsConnected", { 
            inputs: this.webmidi.inputs, 
            outputs: this.webmidi.outputs
        }); 
    }

    private handlePortsDisconnected(){ 
        this.events.emit("portsDisconnected", { 
            inputs: this.webmidi.inputs, 
            outputs: this.webmidi.outputs
        }); 
    }

    public portInUse(portId: string | number) : boolean {
        let inUse = false;
        this.devices.forEach((device) => {
            if (device.portInUse(portId)) inUse = true;
        })
        return inUse;
    }

    public getDeviceStatus(deviceId: string) : object | false {
        let device = this.devices.get(deviceId);
        if (!device) return false;

        return {
            input: device.inputStatus,
            output: device.outputStatus
        }
        
    }

    /**
     * Returns the given MidiDevice instance 
     * 
     * @param deviceId - The device's id string
     */
    public getDevice(deviceId: string){
        return this.devices.get(deviceId);
    }

    /**
     * Wrapper for given devices addInputEvent() function. Same result can be acheived by
     * called getDevice(<deviceId>).addInputEvent(<DeviceEvent>).
     * 
     * @param deviceId 
     * @param inputEvent 
     */
    public addInputEvent(deviceId: string, inputEvent: DeviceEvent){
        let device = this.devices.get(deviceId);
        if (!device) return false;

        return device.addInputEvent(inputEvent);
    }

    public removeInputEvent(deviceId: string, eventId: string){
        let device = this.devices.get(deviceId);
        if (!device) return false;

        return device.removeInputEvent(eventId);
    }

    public pollOutputPort(portId: string | number, note?: string) : boolean {
        let outputPort = this.webmidi.getOutputById(portId);
        if (!outputPort) return false;

        outputPort.playNote(note || "C3");
        return true;
    }

    /**
     * Send a message to the output of the device w/ the given ID. Returns false if the
     * device does not exist, the message type is unrecognized, or if the device does not
     * have a resolved output port instance.
     * 
     * @param deviceId - The id of the device to send the message
     * @param message - An instance of MidiMessage
     * @param options - WebMidi options (???)
     */
    public send(deviceId: string, message: MidiMessage, options?: { [key: string]: any }) : boolean {
        let device = this.devices.get(deviceId);
        if (!device) return false;

        return device.send(message, options);
    }

}
