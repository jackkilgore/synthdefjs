let acorn = require("acorn")
const walk = require("acorn-walk")

// https://www.npmjs.com/package/acorn-walk
// https://github.com/estree/estree/blob/master/es5.md#node-objects

// What I have learned: the only way to probe the internals of a js function 
// is by using .toString(). This is highly unreliable and disgusting.
function reflectTest(name, block) {
	// You cannot access a functions arguments outside of the function itself
	// let block_args = block.arguments
	block_str = block.toString() // use regex for a disgusting way to access the function source
		// we need a more abstracted version of what this does
		// this is incredibly fragile and browser dependent
	console.log(block_str)
	block.params = [10, 3, 4, 7]
	//block(0,800,1,0.9)
	//console.log(block.length)
	var ast = acorn.parse(block.toString(), {ecmaVersion: 2020});
	// Get array of parameters
	// ast.body[0].expression.params
	// 0 is okay because we assert that we only have one function ^

	// Get array of body statements
	//ast.body[0].expression.body.body
	
	//console.log(ast.body[0].expression.params)
	//console.log(ast.body[0].expression.body.body[0].declarations[0].init)
	//console.log(ast.body[0].expression.body.body[0].declarations)

	// Get paramter names
	walk.simple(ast, {
		Function(node) {
			for (let i = 0; i < node.params.length; i++) {
				console.log(node.params[i].name);
			}
		}
		
	  }
	)

	/*
		Identifier(node) {
		  console.log(`Found an identifier: ${node.name}`)
		}
		*/
}

module.exports = {
	reflectTest,
}

