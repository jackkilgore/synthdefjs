const {UGen} = require('./UGen')
const acorn = require("acorn")
const walk = require("acorn-walk")

function captureArguments(func) {
    if (typeof func !== 'function') {
        throw 'captureArguments input is not a function!'
    }
    var ast = acorn.parse( "(" + func.toString() + ")", {ecmaVersion: 2020} )
    var params = []
	walk.full( ast,
		(node) => {
			if (node.type === 'ArrowFunctionExpression' 
				|| node.type === 'FunctionDeclaration' 
				|| node.type === 'FunctionExpression') 
			{
                console.log(`There's an arrow function expression declaration node at ${JSON.stringify(node.loc)}`);
                params = node.params.map((param) => {
					if(param.type === 'Identifier') {
						return {"name":param.name, "default": 0}
					}
					else if (param.type === 'AssignmentPattern') {
						if(param.right.type === 'Literal') {
							return {"name":param.left.name, "default":param.right.value}
						} else {
							throw 'Default is not a literal!';
						}
					}
                })
            }
		}
	)
    return params
}

var SynthDefTemplate = {
    init: function(name, func_graph) {
        this.name = name;
        var funcGraph = func_graph;
        this.args = captureArguments(funcGraph)

        for(let i = 0; i < this.args.length; i++ ) {
            console.log(this.args[i])
        }
    
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
        //func_graph.apply(this,this.args)
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