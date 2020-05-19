import BaseNode, { NodeOptions } from "./base-node";
import MidiPlex from "../midiplex";

export default class FilterNode extends BaseNode {
    constructor(options: NodeOptions){
        super(options);
    }

    // public activate(){

    //     //this.midiplex.clock.
    //     //TODO: Once the clock is implemented, a quantize event subscription will go here
    //     //and be removed on deactivate();
    // }

    // public deactive(){
    //     //TODO: See note on activate()
    // }

}