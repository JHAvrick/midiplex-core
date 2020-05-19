import MidiMessage from '../config/midi-message';

export default interface DefinitionParams {
    receivingEdge: string;
    message: MidiMessage;
    send: Function;
    type: string;
}