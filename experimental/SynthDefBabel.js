let babel = require('@babel/core')
let sc = require("../src/include-synthdef")

// TODO: += typa stuff
const operatorOverload = {
	BinaryExpression(path) {

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
			
			// Resurively replace operators with BinOPs in function definition
			let fn = eval(path.node.callee.name) // oh my, wtf this is disgusting
			let fn_code = fn.toString() // idea, require a keyword at the top of every function
			let fn_out
			try{
				fn_out = babel.transformSync(fn_code, { 
					ast: true,
					plugins: [
						"@babel/plugin-transform-arrow-functions",
						operatorOverloadEntry,
					]
				})
			}
			catch (e) {
				// No synthdefjs header found in the above function
				return 
			}

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
				throw new Error("invalid nested function in SynthDef")
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

function NoSynthDefJSHeader(message) {
	this.message = message
	this.name = 'NoSynthDefJSHeader'
}
// Modified, Original courtesy of the wicked smart Charlie Roberts:
// https://github.com/charlieroberts/jsdsp
function operatorOverloadEntry() {
	return {
	visitor: {
		BlockStatement(path, state) {
        	// off by default
        	let usesynthdefjs = false

        	if( path.node.directives !== undefined ) {
          		path.node.directives.forEach( directive => {
            		if( directive.value.value === 'use synthdefjs' ) {
              			usesynthdefjs = true
            		}
          		})
       		}
			if(!usesynthdefjs) {
				throw new NoSynthDefJSHeader('use synthdefjs FAIL')
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

nested_fn_test = () => {
	"use synthdefjs"
	let sig = sc.SinOsc.ar(220, 0)
	sig = SC_mul(sig, 0.5)
	sig = SC_mul(sig, 0.75)
	sig = SC_something(sig,1.2)
	yees(3,4)
    sc.Out.ar(0, sig)
}

// Stereo FM Synth -- Nice
fm_test = () => {
	"use synthdefjs"
	let mod = sc.SinOsc.ar(Array(2).fill('m_freq'.kr(1))) // stereo propgates through the entire synth
	mod = mod * 'width'.kr(10) + 'c_freq'.kr(220)
    let carrier = sc.SinOsc.ar(mod)
	carrier = carrier * 'amp'.kr(0.5)
    sc.Out.ar(0,carrier)
}

fn_op = fm_test
console.log(`fn_op before babel:\n${fm_test.toString()}\n`)
fnmod = replaceUGenOps(fm_test)
console.log(`fn_op after babel:\n${fnmod.toString()}\n`)
let def0 = sc.SynthDef('def_op', fnmod)
def0.writeDefFile("/Users/jkilgore/Desktop/doi.scsyndef")
