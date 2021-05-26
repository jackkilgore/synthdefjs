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
    "ADDITION":0,
    "SUBTRACTION":1,
    "MULTIPLICATION":2,
}

var BinaryOpUGen = genBasicUGenDef("BinaryOpUGen", ["audio"],{lhs: undefined, rhs: undefined})

function BinOp(operator, lhs, rhs) {
    var obj = BinaryOpUGen.ar(lhs, rhs)
    obj.specialIndex = Operator("MULTIPLICATION") // hard code to multiplication
    return obj
}


module.exports = {
    BinOp
}