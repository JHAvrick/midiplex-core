import WebMidi from 'webmidi';
import EventEmitter from './util/event-emitter';
import DeviceManager from './device/device-manager';
import { DeviceOptions } from './device/device-model';
import GraphManager from './graph/graph-manager';
import { ClockSync } from './clock/clock-sync';

export default class MidiPlex {

    public readonly webmidi: any; //WebMidi instance is public so that it can be accessed directly if need be
    public readonly events: EventEmitter;
    public readonly clock: ClockSync;
    public readonly graphs: GraphManager;
    public devices: DeviceManager;

    constructor(devices?: Array<DeviceOptions>){
        this.webmidi = WebMidi;
        this.events = new EventEmitter();
        this.graphs = new GraphManager(this);
        this.clock = new ClockSync(WebMidi);

        //Enable our WebMidi instance
        this.webmidi.enable((err: any) => {
            if (err) throw err;

            this.devices = new DeviceManager(this.webmidi, devices);
            
            this.events.emit("ready", this);
        }, true);
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

}