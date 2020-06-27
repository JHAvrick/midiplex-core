import { MidiMessage } from '../config/midi-messages';

export default interface DefinitionParams {
    receivingEdge: string;
    message: MidiMessage;
    send: Function;
    type: string;
}