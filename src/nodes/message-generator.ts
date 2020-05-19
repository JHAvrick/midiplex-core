interface NoteOn {
    data?: Uint8Array,
    timestamp?: number,
    channel: number,
    type: string,
    note: {
        number?: number,
        name: string,
        octave?: number
    },
    velocity: number,
    rawVelocity: number
}

interface NoteOff {
    data?: Uint8Array,
    timestamp?: number,
    channel: number,
    type: string,
    note: {
        number?: number,
        name: string,
        octave?: number
    },
    velocity: number,
    rawVelocity: number
}


const Notes = { "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11 }
const MessageGenerator = {
    /**
     * 
     * @param note 
     * @param velocity 
     */
    noteon: function(note?: string, velocity?: number) : NoteOn {
        var name = note.replace(/[0-9-]/g, '');
        var octave = parseInt(note.replace(/[^\d.-]/g, ''));
        var number = (Notes[name] + ( (octave + 1) * 12));
        return <NoteOn> {
            channel: 1,
            type: "noteon",
            note: {
                number: number,
                name: note,
                octave: octave
            },
            velocity: 1,
            rawVelocity: 1
        }
    },

    noteoff: function(note?: string, velocity?: number) : NoteOn {
        var name = note.replace(/[0-9-]/g, '');
        var octave = parseInt(note.replace(/[^\d.-]/g, ''));
        var number = (Notes[name] + ( (octave + 1) * 12));
        return <NoteOff> {
            channel: 1,
            type: "noteoff",
            note: {
                number: number,
                name: note,
                octave: octave
            },
            velocity: 1,
            rawVelocity: 1
        }
    },



}

export default MessageGenerator;








// data Uint8Array
// The raw MIDI message as an array of 8 bit values.
// timestamp Number
// The time when the event occurred (in milliseconds)
// channel Uint
// The channel where the event occurred (between 1 and 16).
// type String
// The type of event that occurred.
// note Object
// number Uint
// The MIDI note number.
// name String
// The usual note name (C, C#, D, D#, etc.).
// octave Uint
// The octave (between -2 and 8).
// velocity Number
// The attack velocity (between 0 and 1).
// rawVelocity Number
// The attack velocity expressed as a 7-bit integer (between 0 and 127).