let babel = require('@babel/core')
let sc = require("../src/include-synthdef")

fn0 = () => {
	let sig = sc.SinOsc.ar(220, 0) * 0.5
    sc.Out.ar(0, sig)
}

let yees = (a,b) => {
	return a * b
}

let SC_add = (a, b) => {
	"use synthdefjs"
	return a + b 
}
let SC_mul = (a, b) => {
	"use synthdefjs"
	return a * b 
} 

// This works, but it duplicates things.
let SC_something = (a,b) => {
	"use synthdefjs"
	return SC_mul(SC_add(a,b), b)
}

fn1 = () => {
	"use synthdefjs"
	let sig = sc.SinOsc.ar(220, 0)
	sig = SC_mul(sig, 0.5)
	sig = SC_mul(sig, 0.75)
	sig = SC_something(sig,1.2)
	yees(3,4)
    sc.Out.ar(0, sig)
}

// TODO: += typa stuff
const operatorOverload = {
	BinaryExpression(path, state) {
		if(!state.usesynthdefjs) {
			return
		}

		// If both sides are numbers, no need to return.
		if (babel.types.isNumericLiteral(path.node.left) && babel.types.isNumericLiteral(path.node.right)) {
			return
		}
		
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
	CallExpression(path, state) {
		// Forces a keyword pre-appened to SC function for now...
		if(path.node.callee.name) {
			if(!state.usesynthdefjs) {
				return
			}
			
			// Resurively replace operators with BinOPs in function definition
			let fn = eval(path.node.callee.name) // oh my, wtf this is disgusting
			let fn_code = fn.toString() // idea, require a keyword at the top of every function
			const fn_out = babel.transformSync(fn_code, { 
				ast: true,
				plugins: [
					"@babel/plugin-transform-arrow-functions",
					operatorOverloadEntry,
				]
			})
			
			// Stupid hack to check if a parse failed because no keyword.
			let is_error_present = fn_out.ast.program.body[0].expression.body.directives.some((directive) => {
				if(directive.value === "use synthdefjs FAIL") return true
				return false
			})
			if(is_error_present) return 

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
			
			// Check if we have already inlined this function.
			let is_present = state.inline_fns.some((name) => {
				if(name === path.node.callee.name) return true
				return false
			})
		
			if(is_present) {
				// Replace function call.
				path.replaceWith(replaced_fn_call)
				return	
			}

			// Now we declare our new function definition.
			var new_fn
			if(fn_out.ast.program.body[0].type === 'FunctionDeclaration') {
				new_fn = fn_out.ast.program.body[0] 
			} else if(fn_out.ast.program.body[0].type === 'ExpressionStatement') {
				new_fn = fn_out.ast.program.body[0].expression
			} else {
				throw "ERROR: invalid nested function in SynthDef"
			}
			
			// Append a new function definition to the 'header' of the function.
			const variable_decl = babel.types.variableDeclaration('const',
				[babel.types.variableDeclarator(callee_id,new_fn)])
			
			state.fn.body.unshift(variable_decl)
			state.inline_fns.push(path.node.callee.name)

			// Replace function call.
			path.replaceWith(replaced_fn_call)
		}
	}
}

// Courtesy of the wicked smart Charlie Roberts:
// https://github.com/charlieroberts/jsdsp
function operatorOverloadEntry() {
	return {
	visitor: {
		BlockStatement(path, state) {
        	// off by default
        	state.usesynthdefjs = false

        	if( path.node.directives !== undefined ) {
          		path.node.directives.forEach( directive => {
            		if( directive.value.value === 'use synthdefjs' ) {
              			state.usesynthdefjs = true
            		}
          		})
       		}
			if(!state.usesynthdefjs) {
				path.node.directives.push(babel.types.directiveLiteral('use synthdefjs FAIL'))
				return
			}

			state.fn = path.node
			if(state.inline_fns === undefined) {
				state.inline_fns = []
			}
			path.traverse(operatorOverload, state)
			path.skip()
			state.usesynthdefjs = false
      },
	}
	}
}

function replaceUGenOps(func_graph) {
	const code = func_graph.toString()
	const output = babel.transform(code, {
  		plugins: [
	  		"@babel/plugin-transform-arrow-functions", // we need this to make `this` behave nicely
			operatorOverloadEntry,
  		],
	});
	// Ahh, the wretched, evil line of code.
	return eval(output.code)
}
fn0mod = replaceUGenOps(fn1)
console.log(fn0mod.toString())
let def0 = sc.SynthDef('def0', fn0mod).readableSynthDefFile()
//console.log(def0)
