const {UGen,genBasicUGenDef} = require('./UGen')

var Control = genBasicUGenDef("Control", ["audio", "control"])


// Named Controls. Forcing users to use this.
var NamedControl = {
    name: "",
    rate: "control",
    values: [],
    synthDef: undefined,
    controlIndex: undefined,
}

function createNamedControlKr(values) {
    obj = Object.create(NamedControl)
    obj.synthDef = UGen.synthDefContext
    obj.name = this.toString()
    obj.rate = 'control'
    obj.values = values
    obj.synthDef.addControl(obj)
    return Control.kr()
}

function createNamedControlAr(values) {
    obj = Object.create(NamedControl)
    obj.synthDef = UGen.synthDefContext
    obj.name = this.toString()
    obj.rate = 'audio'
    obj.values = values
    obj.synthDef.addControl(obj)
    return Control.ar()
}

Reflect.set(String.prototype, 'kr', createNamedControlKr)
Reflect.set(String.prototype, 'ar', createNamedControlAr)