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
                params = node.params.map((param) => {
					if(param.type === 'Identifier') {
						return {"name":param.name, "default": undefined}
					}
					else if (param.type === 'AssignmentPattern') {
						if(param.right.type === 'Literal') {
							return {"name":param.left.name, "default":param.right.value}
						} 
                        else if (param.right.type === 'ArrayExpression' ) {
                            throw 'Default is not a literal!';
                            // annoying to deal with right now, fix later
                            //return {"name":param.left.name, "default":param.right.elements}
                        }
                        else {
							throw 'Default is not a literal!';
						}
					}
                })
            }
		}
	)
    return params
}

// https://stackoverflow.com/questions/4775722/how-to-check-if-an-object-is-an-array
// only implement if no native implementation is available
function isArray(obj) {
    if (typeof Array.isArray === 'undefined') {
        Array.isArray = function(obj) {
          return Object.prototype.toString.call(obj) === '[object Array]';
        }
    } else {
        return Array.isArray(obj)
    }
}


module.exports = {
    captureArguments,
    isArray,
}