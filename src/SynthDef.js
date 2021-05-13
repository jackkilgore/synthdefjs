const {UGen} = require('./UGen')
const {captureArguments} = require('./Utilities')

var SynthDefTemplate = {
    init: function(name, func_graph) {
        this.name = name;
        var funcGraph = func_graph;
        this.args = captureArguments(funcGraph)
    
        this.children = [];
        this.constants = {};
        this.constantSet = new Set();
        
        this.build(funcGraph)
        console.log("Number of nodes:", this.children.length)
        if(!this.checkNodesInputs()) {
            return
        }

    },

    addNode: function(node) {
        console.log("Adding node to graph...")
        node.synthIndex = this.children.length;
        this.children.push(node)
    },

    build: function (func_graph) {
        this.children = []
        UGen.synthDefContext = this
        console.log("SynthDef setting UGen context")
        let args_flat = []
        for(let i = 0; i < this.args.length; i++) {
            args_flat.push(this.args[i].default)
            // console.log(this.args[i].default)
        }
        func_graph.apply(this,args_flat)
    },

    checkNodesInputs: function () {
       for(let i = 0; i < this.children.length; i++) {
           if(!this.children[i].checkInputs()) {
               console.log("ERROR: Invalid Inputs to some UGen.")
               return false
           }
       }
      
    },

    convertArgsToControls: function() {

    }

}

function SynthDef(name, args, func_graph) {
    let obj = Object.create( SynthDefTemplate );
    obj.init(name, args, func_graph)
    return obj
}

module.exports = {
	SynthDef
}