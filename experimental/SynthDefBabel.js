let babel = require('@babel/core')
let sc = require("../src/include-synthdef")

fn0 = () => {
	let sig = sc.SinOsc.ar(220, 0) * 0.5
    sc.Out.ar(0, sig)
}

function operatorOverload() {
	return {
	visitor: {
		BinaryExpression(path) {
			const obj_synthdeflib = babel.types.identifier('this')
			const prop_binop = babel.types.identifier('BinOp')
			const binop = babel.types.memberExpression(obj_synthdeflib,prop_binop)
			const operator = babel.types.stringLiteral(`${path.node.operator}`)
			const expr = babel.types.callExpression(binop,[operator,path.node.left, path.node.right])
			path.replaceWith(expr)
		},
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
fn0mod = replaceUGenOps(fn0)

let def0 = sc.SynthDef('def0', fn0mod).readableSynthDefFile()
console.log(def0)
