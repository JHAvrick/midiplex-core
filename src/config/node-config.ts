export default interface NodeConfig {
    id?: string, //Use a specific ID for this node, necessary when creating nodes based on a previous serialization
    name?: string, //Use a specific name for this node
    deviceId?: string, //Only used for baseTypes 'input' or 'output'
    properties?: { [key: string]: any }, //Serialized property values
    state?: { [key: string]: any } //State if we want the node to start with an initial state other than the default (unusual)
}