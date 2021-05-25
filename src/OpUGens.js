const {UGen,genBasicUGenDef} = require('./UGen')


var BinaryOpUGen = genBasicUGenDef("BinaryOpUGen", ["audio"],{operator: undefined, a: undefined, b: undefined})

module.exports = {
    BinaryOpUGen
}