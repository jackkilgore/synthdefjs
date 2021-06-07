const {UGen, SinOsc, Out} = require('./UGen')
const {BinOp, MulAdd} = require('./OpUGens')
const {captureArguments, addIntToArray8, addFloat32ToArray8, addPascalStrToArray8, isArray} = require('./Utilities')
const fs = require("fs");
var SynthDefTemplate = {
    init: function(name, func_graph) {
        this.name = name;
        var funcGraph = func_graph;
        this.args = captureArguments(funcGraph)
        this.args_to_ctrl = [] 
		this.BinOp = BinOp // Hack needed for operator overloading

        this.nodes = []
        this.constants = []
        this.controls = []
		this.num_control_vals = 0
        
        this.build(funcGraph)
        if(!this.checkNodesInputs()) {
			throw new Error("Invalid input to some UGen in the SynthDef")
       }
        this.collectConstants()

        console.log(`Successfully built SynthDef Graph: ${this.name}. Number of nodes: ${this.nodes.length}.`)
    },

    addNode: function(node) {
        node.synthIndex = this.nodes.length;
        this.nodes.push(node)
    },

    build: function (func_graph) {
        this.nodes = []
        UGen.synthDefContext = this
        let args_flat = []
        for(let i = 0; i < this.args.length; i++) {
            args_flat.push(this.args[i].default)
        }
		// TODO: Add optional flag to allow for Babel transpiling that supports operator overload
		func_graph.apply(this,args_flat)
    },

    checkNodesInputs: function () {
       for(let i = 0; i < this.nodes.length; i++) {
           if(!this.nodes[i].checkInputs()) {
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
            throw new Error("Control object to be added does not have a name or a values property!")
        }
        if(control.rate !== "control" && control.rate !== "audio" &&
            control.rate !== "scalar" && control.rate !== "trigger") {
            throw new Error("Invalid rate for Control UGen.")
        }
        control.controlIndex = this.controls.length
		this.num_control_vals += control.values.length
        this.controls.push(control)

    },

    writeDefFile: function(path) {
        var stream = fs.createWriteStream(path)


        let byte_def = this.writeToBytes()
        // Add header
        const HEADER_SIZE = 10
        let header = new Uint8Array(10)
        const file_type_id = "SCgf"
        for(let i = 0; i < file_type_id.length; i++) {
            header[i] = file_type_id.charCodeAt(i)
        }
        // File version: 2
        const FILE_VERSION = 2 
        addIntToArray8(header, 4, FILE_VERSION, 32)

        // Number of SynthDefs: 1
        const NUM_SYNTH_DEFS = 1 
        addIntToArray8(header, 8, NUM_SYNTH_DEFS, 16)

        stream.on('error', console.error);
        stream.write(header)
        stream.write(byte_def)
        stream.end()
    },

    // Calculate the number of bytes according to the SynthDef
    // This is internal so maybe it should not exist in the SynthDef object
    // How could we do something like that?
    numberOfBytes: function() {
    },

    writeToBytes: function() {
        // We need to specify the size beforehand. We can do some analysis on `def`.
        // Before we go any further, 
        //  let us make sure we like the format returned by `readableSynthDefFile()`
        // Make a global buffer of 65K that can be reused?
        
        // Do it in a JS array and treat each element as a byte -> convert to unint8array 
        //let size = this.numberOfBytes()
        let size = 65536
        let index = 0
        let output = new Uint8Array(size)

        // Synth name
        index = addPascalStrToArray8(output,index,this.name)

        // Num Constants and constants
        index = addIntToArray8(output, index, this.constants.length, 32)
        for(let i = 0; i < this.constants.length; i++) {
            index = addFloat32ToArray8(output, index, this.constants[i])
        }

        // Num of controls and their respective default values.
        index = addIntToArray8(output, index, this.num_control_vals, 32)
        for(let i = 0; i < this.controls.length; i++) {
            if(isArray(this.controls[i].values)) {
				for(let j = 0; j < this.controls[i].values.length; j++) {
					index = addFloat32ToArray8(output, index, this.controls[i].values[j])
				}
            } else {
                index = addFloat32ToArray8(output, index, this.controls[i].values) 
            }
        }

        // Num of control names and their respective names.
        index = addIntToArray8(output, index, this.controls.length, 32)
        // Add param-name
        for(let i = 0; i < this.controls.length; i++) {
            index = addPascalStrToArray8(output, index, this.controls[i].name) 
            index = addIntToArray8(output, index, i ,32) 
        }

        // Num of UGens
        index = addIntToArray8(output, index, this.nodes.length, 32)
        // Add ugen-spec
        for(let i = 0; i < this.nodes.length; i++) {
            // UGen name
            index = addPascalStrToArray8(output, index, this.nodes[i].name)

            // UGen rate
            let rate_str = this.nodes[i].rate
            let rate_int
            if(rate_str === "scalar") {
                rate_int = 0
            } else if (rate_str === "control") {
                rate_int = 1
            } else if (rate_str === "audio") {
                rate_int = 2
            } else {
                throw new Error("UGen has invalid rate.")
            }
            index = addIntToArray8(output, index, rate_int ,8) 

            // Number of inputs 
            index = addIntToArray8(output, index, this.nodes[i].inputs.length ,32) 

            // Number of Outputs
            index = addIntToArray8(output, index, this.nodes[i].numOutputs() ,32)

            // Special index: Used for BinOp stuff
            index = addIntToArray8(output, index, this.nodes[i].specialIndex ,16)

            // Add input-spec
            for(let j = 0; j < this.nodes[i].inputs.length; j++) {
                // Case where the input is a constant. 
                if( Number.isFinite(this.nodes[i].inputs[j])) {
                    let maybe_const_index = this.constants.indexOf(this.nodes[i].inputs[j])
                    if(maybe_const_index === -1) {
                        throw new Error("Constant does not exist in the synthdef's constant set.")
                    }
                    index = addIntToArray8(output, index, -1 ,32)
                    index = addIntToArray8(output, index, maybe_const_index ,32)
                     
                } 
                // Case where the input is a UGen.
                else if (this.nodes[i].inputs[j].synthIndex < this.nodes.length) { 
                    index = addIntToArray8(output, index, this.nodes[i].inputs[j].synthIndex ,32)
                    index = addIntToArray8(output, index, this.nodes[i].inputs[j].outputIndex ,32)
                } else {
					throw new Error("Invalid input to UGen.")
				}
            }

            for(let j = 0; j < this.nodes[i].numOutputs(); j++) {
                index = addIntToArray8(output, index, rate_int , 8)
            }
        }

        // Number of variants...hard coded to 0.
        index = addIntToArray8(output, index, 0 , 16)
        // Since number of variants is 0, no variant-spec. We are done.

        return output.subarray(0, index)
    },

    readableSynthDefFile: function() {
        let SynthDefFile = {}

        SynthDefFile.name = this.name
        SynthDefFile.numConstants = this.constants.length
        SynthDefFile.ConstantValues = []
        for (let i = 0; i < this.constants.length; i++) {
            SynthDefFile.ConstantValues.push(this.constants[i])
        }
		SynthDefFile.numParameters = this.num_control_vals
        SynthDefFile.ParameterValues = []
        SynthDefFile.numParameterNames = this.controls.length
        SynthDefFile.ParameterNames = []
        for(let i = 0; i < this.controls.length; i++) {
			if(isArray(this.controls[i].values)) {
				for(let j = 0; j < this.controls[i].values.length; j++) {
            		SynthDefFile.ParameterValues.push(this.controls[i].values[j])
				}
			} else SynthDefFile.ParameterValues.push(this.controls[i].values)
            SynthDefFile.ParameterNames.push({"name": this.controls[i].name, "index": i})
        }

        SynthDefFile.UGens = []
        for(let i = 0; i < this.nodes.length; i++) {
            let index = {
                "name": this.nodes[i].name, 
                "rate": this.nodes[i].rate, 
                "num_inputs": this.nodes[i].inputs.length, 
                "num_outputs": this.nodes[i].numOutputs(), 
                "special index": this.nodes[i].specialIndex,
                "inputs": [],
                "outputs": []
            }
            for(let j = 0; j < this.nodes[i].inputs.length; j++) {
                if( Number.isFinite(this.nodes[i].inputs[j])) {
                    let maybe_const_index = this.constants.indexOf(this.nodes[i].inputs[j])
                    if(maybe_const_index === -1) {
                        throw new Error("Constant does not exist in the synthdef's constant set.")
                    }
                    index.inputs.push([-1, maybe_const_index]) 
                // if exis in synth nodes, place in inputs. Maybe switch to using maps for nodes. SPEEED
                } else if (this.nodes[i].inputs[j].synthIndex < this.nodes.length) {
                    index.inputs.push([this.nodes[i].inputs[j].synthIndex, this.nodes[i].inputs[j].outputIndex]) // 0 is the output index, 0 if we only have mono outputs
                }
            }
 			for(let j = 0; j < this.nodes[i].numOutputs(); j++) {
            	index.outputs.push(index["rate"])// Hard-coded to always be same as UGen's rate
            }
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
