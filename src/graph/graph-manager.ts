import MidiPlexGraph from './graph';
import MidiPlex from '../midiplex';
import EventEmitter from '../util/event-emitter';

class GraphManager {

    public events: EventEmitter;
    private graphs: Map<string, MidiPlexGraph>;
    private midiplex: MidiPlex;

    constructor(midiplex: MidiPlex){
        this.midiplex = midiplex;
        this.events = new EventEmitter();
        this.graphs = new Map<string, MidiPlexGraph>();
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

    public getGraph(id: string){
        return this.graphs.get(id);
    }

    public addGraph(id: string) : MidiPlexGraph {
        let newGraph = new MidiPlexGraph(this.midiplex, id);
        this.graphs.set(id, newGraph);
        return newGraph;
    }

    public removeGraph(id: string){
        let graph = this.graphs.get(id);
        if (!graph) return;
        graph.deactivate();
        this.graphs.delete(id);
    }

    activate(id: string){
        let graph = this.graphs.get(id);
        if (!graph) return false;
        graph.activate();
    }

    deactivate(id: string){
        let graph = this.graphs.get(id);
        if (!graph) return false;
        graph.deactivate();
    }

}

export default GraphManager;