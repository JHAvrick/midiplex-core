interface DeviceOptions {
    id: string, //The id used internally to identify a device
    name: string, //Display and reference name
    webmidi: {
        inputId?: string, //WebMidi id for this devices input
        outputId?: string, //WebMidi id for this devices output
        inputName?: string, //WebMidi device input name
        outputName?: string, //WebMidi device input name
        inputManufacturer?: string, //WebMidi device manufaturer,
        outputManufacturer?: string, //WebMidi device manufaturer 
    }    
}

interface WebMidiPortIdentifier {
    id?: string | null,
    name?: string | null,
    manufacturer?: string | null
}

interface DeviceEvent {
    id: string, //An id which can be used to reference and remove events, also prevents duplicate events
    events: Array<string>, //An array of events (i.e. noteon, noteoff, controlchange...)
    listener: Function
}

enum DeviceStatus {
    CONNECTED,
    DISCONNECTED
}

export { DeviceOptions, DeviceEvent, DeviceStatus, WebMidiPortIdentifier }