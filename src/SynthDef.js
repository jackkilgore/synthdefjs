const {UGen, Control} = require('./UGen')
const {captureArguments, addIntToArray8, addFloat32ToArray8, addPascalStrToArray8} = require('./Utilities')
const fs = require("fs");

var SynthDefTemplate = {
    init: function(name, func_graph) {
        this.name = name;
        var funcGraph = func_graph;
        this.args = captureArguments(funcGraph)
        this.args_to_ctrl = [] 

    
        this.nodes = []
        this.constants = []
        this.controls = []
        
        this.build(funcGraph)
        console.log("Number of nodes:", this.nodes.length)
        if(!this.checkNodesInputs()) {
            return
        }
        this.collectConstants()

    },

    addNode: function(node) {
        console.log("Adding node to graph...")
        node.synthIndex = this.nodes.length;
        this.nodes.push(node)
    },

    build: function (func_graph) {
        this.nodes = []
        UGen.synthDefContext = this
        console.log("SynthDef setting UGen context")
        let args_flat = []
        for(let i = 0; i < this.args.length; i++) {
            args_flat.push(this.args[i].default)
            // console.log(this.args[i].default)
        }
        //let args_to_ctrl = this.convertArgsToControls()
        func_graph.apply(this,args_flat)
    },

    checkNodesInputs: function () {
       for(let i = 0; i < this.nodes.length; i++) {
           if(!this.nodes[i].checkInputs()) {
               console.log("ERROR: Invalid Inputs to some UGen.")
               return false
           }
       }
       return true
      
    },

    collectConstants: function () {
        let constantSet = new Set()
        for(let i = 0; i < this.nodes.length; i++) {
            for(let j = 0; j < this.nodes[i].inputs.length; j++) {
                // If input is an array, go one nest deeper...
                if( Number.isFinite(this.nodes[i].inputs[j])) {
                    constantSet.add(this.nodes[i].inputs[j])
                } 
            }
        }
        this.constants = Array.from(constantSet)
    },

    addControl: function (control) {
        if(!control.hasOwnProperty('name') || !control.hasOwnProperty('values')) {
            throw 'ERROR: Control object to be added does not have a name or a values property!'
        }
        if(control.rate !== "control" && control.rate !== "audio" &&
            control.rate !== "scalar" && control.rate !== "trigger") {
            throw 'ERROR: Invalid control rate!'
        }

        control.controlIndex = this.controls.length
        this.controls.push(control)

    },
    // Calculate the number of bytes according to the SynthDef
    // This is internal so maybe it should not exist in the SynthDef object
    // How could we do something like that?
    numberOfBytes: function() {
    },

    writeSynthDefFile: function() {
        let def = this.readableSynthDefFile()
        // TODO: convert everything to a byte stream for writing to file or sending to OSC.
        
        // We need to specify the size beforehand. We can do some analysis on `def`.
        // Before we go any further, 
        //  let us make sure we like the format returned by `readableSynthDefFile()`
        // Make a global buffer of 65K that can be reused?
        
        // Do it in a JS array and treat each element as a byte -> convert to unint8array 
        //let size = this.numberOfBytes()
        let size = 65536
        let index = 0
        var output = new Uint8Array(size) //

    },

    readableSynthDefFile: function() {
        let SynthDefFile = {}

        SynthDefFile.name = this.name
        SynthDefFile.numConstants = this.constants.length
        SynthDefFile.ConstantValues = []
        for (let i = 0; i < this.constants.length; i++) {
            SynthDefFile.ConstantValues.push(this.constants[i])
        }

        SynthDefFile.numParameters = this.controls.length
        SynthDefFile.ParameterValues = []
        SynthDefFile.ParameterNames = []
        for(let i = 0; i < this.controls.length; i++) {
            SynthDefFile.ParameterValues.push(this.controls[i].values)
            SynthDefFile.ParameterNames.push({"name": this.controls[i].name, "index": i})
        }

        SynthDefFile.UGens = []
        for(let i = 0; i < this.nodes.length; i++) {
            let index = {
                "name": this.nodes[i].name, 
                "rate": this.nodes[i].rate, 
                "num_inputs": this.nodes[i].inputs.length, 
                "num_outputs": 1, 
                "special index": undefined,
                "inputs": [],
                "outputs": []
            }
            for(let j = 0; j < this.nodes[i].inputs.length; j++) {
                if( Number.isFinite(this.nodes[i].inputs[j])) {
                    let maybe_const_index = this.constants.indexOf(this.nodes[i].inputs[j])
                    if(maybe_const_index === -1) {
                        throw "ERROR: Constant does not exist in the synthdef's constant set."
                    }
                    index.inputs.push([-1, maybe_const_index]) 
                // if exits in synth nodes, place in inputs. Maybe switch to using maps for nodes. SPEEED
                } else if (this.nodes.indexOf(this.nodes[i].inputs[j]) > -1) { 
                    index.inputs.push([this.nodes[i].inputs[j].synthIndex, 0]) // 0 is the output index, 0 if we only have mono outputs
                }
            }
            // TODO : arbitrary number of outputs
            index.outputs.push("audio")
            // for(let j = 0; j < def3.nodes[i].outputs.length; j++) {
            //     index.outputs[i].push(def3.nodes[i].rate)
            // }
            SynthDefFile.UGens.push(index)
        }
        SynthDefFile.numVariants = 0

        return SynthDefFile
    },

    // Deprecated for now
    convertArgsToControls: function() {
        let arg_names = []
        for(let i = 0; i < this.args.length; i++) {
            arg_names.push(this.args[i].name)
            //args_to_ctrl.push(Control.kr(this.args.name))
        }
        return args_to_ctrl
    },

}

function SynthDef(name, args, func_graph) {
    let obj = Object.create( SynthDefTemplate );
    obj.init(name, args, func_graph)
    return obj
}

module.exports = {
	SynthDef
}