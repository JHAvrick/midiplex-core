navigator.requestMIDIAccess().then(function(){

    let mp = new MidiPlex.MidiPlex();
    let nodes = MidiPlex.Nodes;
    
    mp.on('ready', () => {
        console.log("------------------------------- PORTS -------------------------------");
        console.log("INPUTS: " + mp.webmidi.inputs.map((input) => "[" + input.name + " | " + input.id + "]").join(", "));
        console.log("OUTPUTS: " + mp.webmidi.outputs.map((output) => "[" + output.name + " | " + output.id + "]").join(", "));
        console.log("------------------------------- SCENE -------------------------------");

        mp.clock.fromPort("input-1");
        mp.devices.addDevice({
            id: "monologue",
            name: "Monologue",
            webmidi: {
                //inputId: "input-0", //WebMidi id for this devices input
                outputId: "output-4", //WebMidi id for this devices output
            }   
        });

        console.log(MidiPlex.Nodes);

        let graph = mp.graphs.addGraph("scene");
        let inputNode = graph.addNode(MidiPlex.Nodes.INPUT_DEVICE_NODE);
        let outputNode = graph.addNode(MidiPlex.Nodes.OUTPUT_DEVICE_NODE);
            outputNode.setDeviceId("monologue");

        let debugNode = graph.addNode(MidiPlex.Nodes.DEBUG_NODE);
        let clockNode = graph.addNode(MidiPlex.Nodes.CLOCK_TEST_NODE);
        let routeNode = graph.addNode(MidiPlex.Nodes.ROUTE_MESSAGE_TYPE_NODE);
            routeNode.addOutputEdge("noteon", ["noteon"]);
        
        // clockNode  
        // .out("out").to(routeNode.in("in")) //ClockNode:out --> RouteNode:in
        // .out("noteon").to(debugNode.in("in")); //RouteNode:noteon --> DebugNode:in

        //debugNode.out("thru").to(clockNode.in("in"));

        //clockNode.hasDownstreamNode(debugNode);

        debugNode.out("thru").to(clockNode.in("in"));

        debugNode.in("in").from(clockNode.out("out"));

        //clockNode.out("out").to(debugNode.in("in"));

        //console.log(clockNode.hasDownstreamNode(debugNode))

        //clockNode.to("out", outputNode.getInputEdge("in"));

        graph.activate();

        //inputNode.setDeviceId("VI49");
        // outputNode.setDeviceId("virtual");

        // console.log(mp.devices);

        // // console.log(inputNode);
        // // console.log(outputNode);
    
        // // console.log(inputNode.getOutputEdge("out"));
        // // console.log(outputNode.getInputEdge("in"));
        


        // let output = mp.webmidi.getOutputById("output-4");
        // mp.clock.fromPort("input-1");

        // console.log(mp.clock);


        // var lastNote;
        // var index = 0;
        // var seq = ["C4", "D4", "E5", "F5", "G6", "A6", "B6"]

        // mp.clock.on("start", () => {
        //     console.log("Start");
        //     //output.playNote("C4");
        //     output.playNote(seq[0]);
        //     index += 1;
        //     lastNote = seq[0];
        // })

        // mp.clock.on("stop", () => {
        //     output.stopNote(lastNote);
        // })

        // function shuffle(a) {
        //     var j, x, i;
        //     for (i = a.length - 1; i > 0; i--) {
        //         j = Math.floor(Math.random() * (i + 1));
        //         x = a[i];
        //         a[i] = a[j];
        //         a[j] = x;
        //     }
        //     return a;
        // }


        // mp.clock.on("1/4", () => {
        //     console.log("1/4");
        //     //output.stopNote("C4");
        //     //output.playNote("C4");
            
        //     if (lastNote){
        //         output.stopNote(lastNote);
        //     }

        //     //seq = shuffle(seq);

            
        //     index = index === (seq.length - 1) ? 0 : index + 1;
        //     output.playNote(seq[index]);
        //     lastNote = seq[index];

        // }) 


        // interface DeviceOptions {
        //     id: string, //The id used internally to identify a device
        //     name: string, //Display and reference name
        //     webmidi: {
        //         inputId?: string, //WebMidi id for this devices input
        //         outputId?: string, //WebMidi id for this devices output
        //         inputName?: string, //WebMidi device input name
        //         outputName?: string, //WebMidi device input name
        //         inputManufacturer?: string, //WebMidi device manufaturer,
        //         outputManufacturer?: string, //WebMidi device manufaturer 
        //     }    
        // }

        // mp.devices.addDevice({
        //     id: "VI49",
        //     name: "VI49",
        //     webmidi: {
        //         inputId: "input-0", //WebMidi id for this devices input
        //         //outputId: "output-3", //WebMidi id for this devices output
        //     }   
        // });

        // mp.devices.addDevice({
        //     id: "virtual",
        //     name: "virtual",
        //     webmidi: { outputId: "output-3", }   
        // });

        // mp.devices.addDevice({
        //     id: "clock",
        //     name: "clock",
        //     webmidi: {
        //         inputId: "input-1", //WebMidi id for this devices input
        //         //outputId: "output-3", //WebMidi id for this devices output
        //     }   
        // });

        // let graph = mp.graphs.addGraph("scene");
        // let inputNode = graph.addNode(MidiPlex.Nodes.INPUT_DEVICE_NODE);
        // let outputNode = graph.addNode(MidiPlex.Nodes.OUTPUT_DEVICE_NODE);
        
        // inputNode.setDeviceId("VI49");
        // outputNode.setDeviceId("virtual");

        // console.log(mp.devices);

        // // console.log(inputNode);
        // // console.log(outputNode);
    
        // // console.log(inputNode.getOutputEdge("out"));
        // // console.log(outputNode.getInputEdge("in"));
        
    
        // let connection = inputNode.to("out", outputNode.getInputEdge("in"));

        // console.log(connection);

        // console.log(outputNode);

        // let output = mp.webmidi.getOutputById("output-4");
        // let frames = 0;
        // var milliseconds = Date.now();

        // let lastTimeStamp = 0;
        // let aggregateTimestamp = 0;

        // mp.webmidi.getInputById("input-1").addListener("start", "all", function(e){
        //     console.log("start!");

        //     //output.stopNote("C4");
        //     output.playNote("C4");
        //     //mp.webmidi.getOutputById("output-4").playNote("C4");
        //     //frames = frames + 1;
        // })

        // mp.webmidi.getInputById("input-1").addListener("stop", "all", function(e){
        //     console.log("stop!");
        //     frames = 0;
        //     //mp.webmidi.getOutputById("output-4").playNote("C4");
        // })

        // mp.devices.getDevice('clock').addInputEvent(
        //     { 
        //         id: "testevent",
        //         events: ["clock"],
        //         listener: function(e){
        //             //console.log(e);
        //             // console.log(frames);
                    
        //             frames = frames + 1;

        //             aggregateTimestamp = lastTimeStamp !== 0 ? e.timestamp - lastTimeStamp : aggregateTimestamp;
        //             lastTimeStamp = e.timestamp;

        //             if (frames === 12){
        //                 output.stopNote("C4");
        //                 output.playNote("C4");
        //                 //setTimeout(() => output.stopNote("C4"), 25)

        //                 //var now = Date.now();

        //                 //console.log(now - milliseconds);

        //                 console.log(aggregateTimestamp);
                        

        //                 //milliseconds = now;

        //                 aggregateTimestamp = 0;
        //                 frames = 0;
        //             } 

                    
        //         }
        //     }
        // )


    })

}, function(err){
    console.log(err);
});

//navigator.close(); // This will close MIDI inputs,
                   // otherwise Node.js will wait for MIDI input forever.
// In browsers the funcion is neither defined nor required.





