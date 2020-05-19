import { DeviceOptions, DeviceEvent, DeviceStatus } from './device-model';
import InputDevice from './input-device';
import OutputDevice from './output-device';
import EventEmitter from '../util/event-emitter';
import MidiMessage from '../config/midi-message';

class MidiDevice {

    public id: string;
    public name: string;
    public events: EventEmitter;

    private webmidi: any;
    private input: InputDevice;
    private output: OutputDevice;

    constructor(webmidi: any, options: DeviceOptions ){
        this.webmidi = webmidi;
        this.id = options.id;
        this.name = options.name;
        this.events = new EventEmitter();
        this.input = new InputDevice(webmidi, options.webmidi.inputId);
        this.output = new OutputDevice(webmidi, options.webmidi.outputId);
    }

    public portInUse(portId: string | number){
        return (this.input.portId === portId || this.output.portId === portId);
    }

    public addInputEvent(inputEvent: DeviceEvent){
        return this.input.addEvent(inputEvent);
    }

    public removeInputEvent(eventId: string){
        return this.input.removeEvent(eventId);
    }

    public setInputPort(portId: string){
        this.input.setPort(portId);
        this.events.emit("portChange", this);
    }

    public setOutputPort(portId: string){
        this.output.setPort(portId);
        this.events.emit("portChange", this);
    }

    public send(message: MidiMessage, options?: { [key: string]: any }) : boolean {
        return this.output.send(message, options);
    }

    public cleanup(){
        this.input.cleanup();
        this.output.cleanup();
    }

    get inputStatus(): DeviceStatus {
        return this.input.status;
    }

    get outputStatus(): DeviceStatus {
        return this.output.status;
    }

}

export default MidiDevice;