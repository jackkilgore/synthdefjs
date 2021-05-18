const {UGen, Control} = require('./UGen')
const {captureArguments} = require('./Utilities')

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