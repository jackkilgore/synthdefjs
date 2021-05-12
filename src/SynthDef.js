const {UGen} = require('./UGen')

var SynthDefTemplate = {
    init: function(name, args, func_graph) {
        this.name = name;
        this.args = args;
        var funcGraph = func_graph;
    
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
        func_graph.apply(this,this.args)
    },

    checkNodesInputs: function () {
       for(let i = 0; i < this.children.length; i++) {
           if(!this.children[i].checkInputs()) {
               console.log("ERROR: Invalid Inputs to some UGen.")
               return false
           }
       }
      
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