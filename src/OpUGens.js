const {UGen,genBasicUGenDef} = require('./UGen')

// Reference: https://github.com/josiah-wolf-oberholtzer/supriya/blob/57fa3459f3c00dd8a0f35ca87abe333bc1c0190f/supriya/enums.py#L20
// ABSOLUTE_DIFFERENCE = 38  # |a - b|
// ADDITION = 0
// AMCLIP = 40
// ATAN2 = 22
// BIT_AND = 14
// BIT_OR = 15
// BIT_XOR = 16
// CLIP2 = 42
// DIFFERENCE_OF_SQUARES = 34  # a*a - b*b
// EQUAL = 6
// EXCESS = 43
// EXPRANDRANGE = 48
// FLOAT_DIVISION = 4
// FILL = 29
// FIRST_ARG = 46
// FOLD2 = 44
// GREATEST_COMMON_DIVISOR = 18
// GREATER_THAN_OR_EQUAL = 11
// GREATER_THAN = 9
// HYPOT = 23
// HYPOTX = 24
// INTEGER_DIVISION = 3
// LEAST_COMMON_MULTIPLE = 17
// LESS_THAN_OR_EQUAL = 10
// LESS_THAN = 8
// MAXIMUM = 13
// MINIMUM = 12
// MODULO = 5
// MULTIPLICATION = 2
// NOT_EQUAL = 7
// POWER = 25
// RANDRANGE = 47
// RING1 = 30  # a * (b + 1) == a * b + a
// RING2 = 31  # a * b + a + b
// RING3 = 32  # a*a*b
// RING4 = 33  # a*a*b - a*b*b
// ROUND = 19
// ROUND_UP = 20
// SCALE_NEG = 41
// SHIFT_LEFT = 26
// SHIFT_RIGHT = 27
// SQUARE_OF_DIFFERENCE = 37  # (a - b)^2
// SQUARE_OF_SUM = 36  # (a + b)^2
// SUBTRACTION = 1
// SUM_OF_SQUARES = 35  # a*a + b*b
// THRESHOLD = 39
// TRUNCATION = 21
// UNSIGNED_SHIFT = 28
// WRAP2 = 45
const Operator = {
	"+": { sindex: 0, op: (a,b) => {return a + b} },
	"-": { sindex: 1, op: (a,b) => {return a - b} },
	"*": { sindex: 2, op: (a,b) => {return a * b} },
	"div": { sindex: 3, op: (a,b) => {return Math.floor(a / b)} },
	"/": { sindex: 4, op: (a,b) => {return a / b} },
	"%": { sindex: 5, op: (a,b) => {return a % b} },
	"===": { sindex: 6, op: (a,b) => {return a === b} },
	"!==": { sindex: 7, op: (a,b) => {return a !== b} },
	"<": { sindex : 8, op: (a,b) => {return a < b} },
	">": { sindex : 9, op: (a,b) => {return a > b} },
	"<=": { sindex : 10, op: (a,b) => {return a <= b} },
	">=": { sindex : 11, op: (a,b) => {return a >= b} },
	"min": { sindex : 12, op: (a,b) => {return Math.min(a,b)} },
	"max": { sindex : 13, op: (a,b) => {return Math.max(a,b)} },
	"&": { sindex : 14, op: (a,b) => {return a & b} },
	"|": { sindex : 15, op: (a,b) => {return a | b} },
	"^": { sindex : 16, op: (a,b) => {return a ^ b} },
	"pow": { sindex : 25, op: (a,b) => {return Math.pow(a,b)} },
	"<<": { sindex : 26, op: (a,b) => {return a << b} },
	">>": { sindex : 27, op: (a,b) => {return a >> b} },
	">>>": { sindex : 28, op: (a,b) => {return a >>> b} },
}

var BinaryOpUGen = genBasicUGenDef("BinaryOpUGen",  ["audio", "control"], {lhs: undefined, rhs: undefined})

function BinOp(operator, lhs, rhs) {
    let is_const = false
    if(Number.isFinite(lhs) && Number.isFinite(rhs)) {
        is_const = true 
    }
    let opkey = operator in Operator ? operator : null
	if(!opkey) {
		throw "ERROR: Invalid operator passed to BinOp"
	}
    // Don't make a UGen, just a constant
    // This is okay because we collect our constants AFTER we build the UGen.
    // Sidenote: making a visualization of this program would be helpful.
    if(is_const) {
        return Operator[opkey].op(lhs,rhs)
    }
	// See if a BinOp is necessary...
	if(operator === '*') {	
		if(lhs === 0 || rhs === 0) {
			console.log("EHHH BIG SHOTS HUUU")
			return 0
		}
		if(lhs === 1) {
			return rhs
		}
		if(rhs === 1) {
			return lhs
		}
	}
	if(operator === '+' || operator === '-') {
		if(lhs === 0) {
			return rhs
		}
		if(rhs === 0) {
			return lhs
		}
	}

	// Now we must determine the rate of the UGen
	if(lhs.rate == "audio" || rhs.rate == "audio") {
		var obj = BinaryOpUGen.ar(lhs,rhs)	
	} else if (lhs.rate = "control" || rhs.rate == "control") {
		var obj = BinaryOpUGen.kr(lhs,rhs)
	} else {
		throw "ERROR: BinaryOpUGen only supports audio and control rates."
	}
	// Set the special index corresponding to the operator.
    obj.specialIndex = Operator[opkey].sindex

    return obj
}


module.exports = {
    BinOp
}
