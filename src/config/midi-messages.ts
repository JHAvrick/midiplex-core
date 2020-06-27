interface MidiMessage {
    target: object, //The Input that triggered the event.
    data: Uint8Array, //The raw MIDI message as an array of 8 bit values.
    timestamp: number, // The timestamp when the event occurred (in milliseconds since the Unix Epoch).
    type: string, //The type of event that occurred.
}

interface ActiveSensing extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string
}

interface ChannelAftertouch extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    channel: number,
    type: string,
    value: number //The aftertouch value received (between 0 and 1).
}


interface ChannelMode extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    channel: number,
    type: string,
    controller: {
        number: number,
        name: string,
    }
    value: number,
}

interface Clock extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string
}

interface Continue extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string
}

interface ControlChange extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    channel: number,
    type: string,
    controller: {
        number: number,
        name: string,
    }
    value: number,
}

interface KeyAftertouch extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    channel: number,
    type: string,
    note: {
        number: number,
        name: string,
        octave: number
    }
    velocity: number,
    rawVelocity: number
}


interface NoteOff extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    channel: number,
    type: string,
    note: {
        number: number,
        name: string,
        octave: number
    }
    velocity: number,
    rawVelocity: number
}

interface NoteOn extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    channel: number,
    type: string,
    note: {
        number: number,
        name: string,
        octave: number
    }
    velocity: number,
    rawVelocity: number
}

interface Nrpn extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    channel: number,
    type: string,
    controller: {
        number: number, //The number of the NRPN.
        name: string, //The usual name or function of the controller.
    }
    value: number, //The value received (between 0 and 65535).
}

interface PitchBend extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    channel: number,
    type: string,
    value: number //The pitch bend value received (between -1 and 1).
}


interface ProgramChange extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    channel: number,
    type: string,
    value: number //The value received (between 0 and 127).
}

interface Reset extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string
}

interface SongPosition extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string
}

interface SongSelect extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string,
    song: string //Song (or sequence) number to select.
}

interface Start extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string
}

interface Stop extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string
}

interface Sysex extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string
}

interface Timecode extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string
}

interface TuningRequest extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string
}

interface UnknownSystemMessage extends MidiMessage {
    target: object,
    data: Uint8Array,
    timestamp: number,
    type: string
}

export { 
    ActiveSensing,
    ChannelAftertouch,
    ChannelMode,
    Clock,
    Continue,
    ControlChange,
    KeyAftertouch,
    MidiMessage,
    NoteOff,
    NoteOn,
    Nrpn,
    PitchBend,
    ProgramChange,
    Reset,
    SongPosition,
    SongSelect,
    Start,
    Stop,
    Sysex,
    Timecode,
    TuningRequest,
    UnknownSystemMessage
}