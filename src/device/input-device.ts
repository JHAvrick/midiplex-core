import { DeviceStatus, DeviceEvent } from './device-model';

class InputDevice {

    //Input Device
    public status: DeviceStatus;
    private portEvents: Map<string, DeviceEvent>;
    public portId: string | number;

    //WebMidi
    private webmidi: any;
    private portInstance: any;

    constructor(webmidi: any, portId: string | number){
        this.status = DeviceStatus.DISCONNECTED;
        this.webmidi = webmidi;
        this.portEvents = new Map<string, DeviceEvent>();
        this.portId = portId;
        this.setPort(portId);

        //Call cleanup() to remove these listeners
        this.webmidi.addListener('connected', this.rebindPort.bind(this));
        this.webmidi.addListener('disconnected', this.rebindPort.bind(this));
    }

    /**
     * Called when WebMidi emits a 'connected' or 'disconnected' event to update
     * the status of this devices port.
     */
    private rebindPort(){
        this.setPort(this.portId);
    }

    public setPort(portId: string | number){
        //Clear input events on current port
        this.clearPortEvents();

        //Attempt to fetch our port instance
        this.portId = portId;
        this.portInstance = this.webmidi.getInputById(this.portId);
        this.status = this.portInstance ? DeviceStatus.CONNECTED : DeviceStatus.DISCONNECTED;

        //Add input events to new port and emit port change event
        this.bindPortEvents();
    }

    public addEvent(portEvent: DeviceEvent){
        if (!portEvent.id || this.portEvents.has(portEvent.id)) return false;
        
        /**
         * Add the event to our portEvents regardless or whether we have a connected portInstance or not.
         * These events will be used if our portInstance is resolved later.
         */
        this.portEvents.set(portEvent.id, portEvent);
        
        //If we do have a port instance, add our listeners
        if (this.portInstance != null && this.portInstance != false)  {
            portEvent.events.forEach((event: string) => {
                this.portInstance.addListener(event, 'all', portEvent.listener);
            });
        }

        return portEvent.id; //Return the id by which this event can be removed later
    }

    public removeEvent(eventId: string){
        let portEvent = this.portEvents.get(eventId);
        if (!portEvent) return false;

        //If we do have a port instance, remove our listeners
        if (this.portInstance != null && this.portInstance != false)  {
            portEvent.events.forEach((event: string) => {
                this.portInstance.removeListener(event, 'all', portEvent.listener);
            });
        }

        return true; //Return true if the events existed and were removed
    }

    private bindPortEvents(){
        if (!this.portInstance) return false;
        this.portEvents.forEach((portEvent: DeviceEvent) => {
            portEvent.events.forEach((event: string) => {
                this.portInstance.addListener(event, 'all', portEvent.listener);
            })
        })

        return true;
    }

    private clearPortEvents(){
        if (!this.portInstance) return false;
        this.portEvents.forEach((portEvent: DeviceEvent) => {
            portEvent.events.forEach((event: string) => {
                this.portInstance.removeListener(event, 'all', portEvent.listener);
            })
        })

        return true;
    }

    public cleanup(){
        this.clearPortEvents();
        this.webmidi.removeListener('connected', this.rebindPort.bind(this));
        this.webmidi.removeListener('disconnected', this.rebindPort.bind(this));
    }

}

export default InputDevice;

