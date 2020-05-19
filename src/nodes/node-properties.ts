export default class NodeProperties {

    private properties: Map<string, any>;

    constructor(initialProperties: Array<object> = []){
        initialProperties.forEach((prop) => 
            this.properties.set(prop[0], prop[1])
        );
    }

    addProperty(name: string, value: any){
        this.properties.set(name, value)
    }

    setProperty(name: string, value: any){

    }

    getProperty(name: string) {
        
    }
}