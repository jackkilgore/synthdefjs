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

function isUint8Array(obj) {
    return Object.prototype.toString.call(obj) === '[object Uint8Array]';
}


function addPascalStrToArray8(array8, index, string) {
    if(!isUint8Array(array8)) {
        throw "ERROR: buffer inputted into 'insertPascalString' is not a Uint8Array"
    }
    // Size of string plus its size
    let str_size = string.length
    if(index + str_size + 1 >= array8.length || str_size > 255) {
        throw "ERROR: string too large to be inserted as a pascal string into array8!"
    }
    array8[index] = str_size
    index += 1
    let i = 0
    while( i < str_size) {
        array8[index] = string.charCodeAt(i)
        index += 1
        i += 1
    }
    return index
}

const num_to_hex = num => num.toString(16)
const hex_to_num = hex => parseInt(hex,16)

// TODO add check to see if `num` is within the range of the inputted bits...
function addIntToArray8(array8, index, num, bits) {
    if(bits !== 8 && bits !== 16 && bits !== 32 && bits !== 64) {
        throw `ERROR: num of bits inputted: ${bits}. Mut be 8, 16, 32, or 64.`
    }
    if(index + bits / 8 >= array8.length) {
        throw `ERROR: int${bits} too large to be inserted into array8!`
    }

    let hex_num 
    hex_num = num_to_hex(Math.abs(num))

    let hex_size = bits / 4
    let i = 0
    hex_num = '0'.repeat(hex_size - hex_num.length) + hex_num
    
    //console.log(hex_num)
    if(num > 0) {
        while(i < hex_size) {
            array8[index] = hex_to_num(hex_num.substr(i,2))
            i += 2
            index += 1
        }
    } else {
        while(i < hex_size) {
            array8[index] = ~hex_to_num(hex_num.substr(i,2))
            i += 2
            index += 1
        }
        array8[index - 1] += 1
    }

    return index
}

function addFloat32ToArray8(array8, index, num) {
    var int_num = float32ToInt32(Math.abs(num))
    bin_num = int_num.toString(2)
    bin_num = '0'.repeat(31 - bin_num.length) + bin_num
    bin_num = num >= 0 ? '0' + bin_num : '1' + bin_num 
    let i = 0
    while(i < 32) {
        array8[index] = parseInt(bin_num.substr(i,8),2)
        i += 8
        index += 1
    }
    return index
}

// Thank you Haravikk
// https://stackoverflow.com/questions/15935365/convert-float-to-bytes-in-javascript-without-float32array
function float32ToInt32(value) {
    var bytes = 0;
    switch (value) {
        case Number.POSITIVE_INFINITY: bytes = 0x7F800000; break;
        case Number.NEGATIVE_INFINITY: bytes = 0xFF800000; break;
        case +0.0: bytes = 0x40000000; break;
        case -0.0: bytes = 0xC0000000; break;
        default:
            if (Number.isNaN(value)) { bytes = 0x7FC00000; break; }

            if (value <= -0.0) {
                bytes = 0x80000000;
                value = -value;
            }

            var exponent = Math.floor(Math.log(value) / Math.log(2));
            var significand = ((value / Math.pow(2, exponent)) * 0x00800000) | 0;

            exponent += 127;
            if (exponent >= 0xFF) {
                exponent = 0xFF;
                significand = 0;
            } else if (exponent < 0) exponent = 0;

            bytes = bytes | (exponent << 23);
            bytes = bytes | (significand & ~(-1 << 23));
        break;
    }
    return bytes;
};


module.exports = {
    captureArguments,
    addPascalStrToArray8,
    addIntToArray8,
    addFloat32ToArray8,
    isArray,
}