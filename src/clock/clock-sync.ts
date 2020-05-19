import EventEmitter from '../util/event-emitter';

interface ClockEventData {
    type: "start" | "tick" | "stop"
}

const ClockSyncEvents = {
    q32: "1/32",
    q16: "1/16",
    q8: "1/8",
    q4: "1/4",
    q2: "1/2",
    q1: "1/1",
}

class ClockSync {

    public events : EventEmitter;
    private readonly webmidi: any;
    private portInstance: any;
    private portId: string | number;

    //Timing variables
    private resolution: number; //Number frames per quarter note
    private frames: number;
    private milliseconds: number;
    private seconds: number;
    private minutes: number;
    private hours: number;
    private q64: number;
    private q32: number;
    private q16: number;
    private q8: number;
    private q4: number;
    private q2: Number;
    private q1: Number;
    
    constructor(webmidi: any, portId?: string | number){
        this.webmidi = webmidi;
        this.events = new EventEmitter()

        this.resolution = 24;
        this.frames = 0;
        this.milliseconds = 0;
        this.seconds = 0;
        this.minutes = 0;
        this.q64 = 0;
        this.q32 = 0;
        this.q16 = 0;
        this.q8 = 0;
        this.q4 = 0;
        this.q2 = 0;
        this.q1 = 0;

        this.portId = portId;
        if (this.portId != undefined){
            this.fromPort(portId);
        }

        this._start = this._start.bind(this);
        this._stop = this._stop.bind(this);
        this._clock = this._clock.bind(this);
    }

    /**
     * Add a listener for a specific clock event
     * 
     * @param event
     * @param callback 
     */
    on(event : string, callback : Function){
        this.events.on(event, callback);
    }

    _start(){
        this.events.emit("start", <ClockEventData> {
            type: "start"
        });
    }

    _stop(){
        this.frames = 0;
        this.milliseconds = 0;
        this.seconds = 0;
        this.minutes = 0;
        this.q64 = 0;
        this.q32 = 0;
        this.q16 = 0;
        this.q8 = 0;
        this.q4 = 0;
        this.q1 = 0;
        this.events.emit("stop", <ClockEventData> {
            type: "stop"
        });
    }

    _clock(){
        /**
         * Increment our beats based on the current frame. By default there are 24 frames per quarter note.
         */
        this.frames = this.frames + 1;
        this.q32 = this.frames % (this.resolution / 8) === 0 ? this._increment("q32") : this.q32;
        this.q16 = this.frames % (this.resolution / 4) === 0 ? this._increment("q16") : this.q16;
        this.q8 = this.frames % (this.resolution / 2) === 0 ? this._increment("q8") : this.q8;
        this.q4 = this.frames % this.resolution === 0 ? this._increment("q4") : this.q4;
        this.q2 = this.frames % (this.resolution * 2) === 0 ? this._increment("q2") : this.q2;
        this.q1 = this.frames % (this.resolution * 4) === 0 ? this._increment("q1") : this.q1;

        /**
         * TODO: Trigger the event for this exact bar
         */
        // let barString = .padStart(5, "0")
        // this.events.emit("00001.01.01.01")

    }

    _increment(beat) : number {
        this.events.emit(ClockSyncEvents[beat], <ClockEventData> {
            type: "tick"
        });
        return this[beat] + 1;
    }

    /**
     * Set the input port id from which the clock events will originate
     * 
     * @param portId - an input port
     */
    fromPort(portId: string | number) : boolean {
        this.portId = portId;
        if (this.portInstance){
            this.portInstance = null;
            this.portInstance.removeListener("start", "all", this._start);
            this.portInstance.removeListener("stop", "all", this._stop);
            this.portInstance.removeListener("clock", "all", this._clock);
        }

        this.portInstance = this.webmidi.getInputById(portId);
        if (this.portInstance){
            this.portInstance.addListener("start", "all", this._start);
            this.portInstance.addListener("stop", "all", this._stop);
            this.portInstance.addListener("clock", "all", this._clock);
            return true;
        }

        return false;
    }

}

export { ClockSync, ClockEventData };