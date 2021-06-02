let babel = require('@babel/core')
let sc = require("../src/include-synthdef")

fn0 = () => {
	let sig = sc.SinOsc.ar(220, 0) * 0.5
    sc.Out.ar(0, sig)
}

let SC_add = (a, b) => {
	"synthdefjs"
	return a + b 
}
let SC_mul = (a, b) => {
	"synthdefjs"
	return a * b 
} 

// This works, but it duplicates things.
let SC_something = (a,b) => {
	return SC_mul(SC_add(a,b), b)
}

fn1 = () => {
	let sig = sc.SinOsc.ar(220, 0)
	sig = SC_something(sig,1.2)
	sig = SC_mul(sig, 0.5)
	sig = SC_mul(sig, 0.75)
    sc.Out.ar(0, sig)
}

function operatorOverload() {
	return {
	visitor: {
		BinaryExpression(path) {
			// Using this breaks for nested functions
			const obj_synthdeflib = babel.types.identifier('this')
			const prop_binop = babel.types.identifier('BinOp')
			const binop = babel.types.memberExpression(obj_synthdeflib,prop_binop)
			const operator = babel.types.stringLiteral(`${path.node.operator}`)
			const expr = babel.types.callExpression(binop,[operator,path.node.left, path.node.right])
			path.replaceWith(expr)
		},
		// Nested functions makes the complexity of this blow up. At this point it's not worth it
		// We would have to be able to dynamically build ASTs for any user-written function call
		// Basically we would have to recursively call transformSync... AHAHAHA
		CallExpression(path) {
			// Forces a keyword pre-appened to SC function for now...
			if(path.node.callee.name && path.node.callee.name.startsWith('SC_')) {
				
				// To make `this` work, we must apply a new this context to every nested function.	
				// Make callee
				const callee_id = babel.types.identifier(path.node.callee.name)
				const prop_apply = babel.types.identifier('call')
				const callee_apply = babel.types.memberExpression(callee_id,prop_apply)
				
				// Make argument list
				let args = [babel.types.thisExpression()]
				args = args.concat(path.node.arguments)
				let replaced_fn_call = babel.types.callExpression(callee_apply,args)
				// We will replace the current node after doing some checks...
								
				// Look for the program path, TODO: store globally 
				let where = path
				// TODO: fail more elegant
				while(where.node.type !== 'Program') {
					where = where.parentPath	
				}

				// Check if we have already inlined this function.
				let fn_body = where.node.body[0].expression.body.body
				let is_present = fn_body.some((decl) => {
					if(decl.type === 'VariableDeclaration') {
						for ( let i = 0; i <  decl.declarations.length; i++) {
							if(decl.declarations[i].id.name === path.node.callee.name) {
								return true
							}
						}
						return false
					}
					return false
				})
			
				if(is_present) {
					// Replace function call.
					path.replaceWith(replaced_fn_call)
					return	
				}

				// Resurively replace operators with BinOPs in function definition
				let fn = eval(path.node.callee.name) // oh my, wtf this is disgusting
				let fn_code = fn.toString() // idea, require a keyword at the top of every function
				const fn_out = babel.transformSync(fn_code, { 
					ast: true,
					plugins: [
						"@babel/plugin-transform-arrow-functions",
						operatorOverload
					]
				})

				// Now we declare our new function definition.
				var new_fn
				if(path.node.callee,fn_out.ast.program.body[0].type === 'FunctionDeclaration') {
					new_fn = fn_out.ast.program.body[0] 
				} else if(path.node.callee,fn_out.ast.program.body[0].type === 'ExpressionStatement') {
					new_fn = fn_out.ast.program.body[0].expression
				} else {
					throw "ERROR: invalid nested function in SynthDef"
				}
				
				
				// Append a new function definition to the 'header' of the function.
				const variable_decl = babel.types.variableDeclaration('const',
					[babel.types.variableDeclarator(callee_id,new_fn)])
				
				fn_body.unshift(variable_decl)

				// Replace function call.
				path.replaceWith(replaced_fn_call)
			}
		}
	},
	}
}

function replaceUGenOps(func_graph) {
	const code = func_graph.toString()
	const output = babel.transformSync(code, {
  		plugins: [
	  		"@babel/plugin-transform-arrow-functions", // we need this to make `this` behave nicely
	  		operatorOverload
  		],
	});
	// Ahh, the wretched, evil line of code.
	return eval(output.code)
}
fn0mod = replaceUGenOps(fn1)
console.log(fn0mod.toString())
let def0 = sc.SynthDef('def0', fn0mod).readableSynthDefFile()
//console.log(def0)
