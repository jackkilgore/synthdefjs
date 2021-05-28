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

const createNamedControlKr = function(values) {
    named_control = Object.create(NamedControl)
    named_control.synthDef = UGen.synthDefContext
    named_control.name = this.toString()
    named_control.rate = 'control'
    named_control.values = values
    named_control.synthDef.addControl(named_control)
    control = Control.kr()
    control.specialIndex = named_control.controlIndex
    return control
}

const createNamedControlAr = function(values) {
    named_control = Object.create(NamedControl)
    named_control.synthDef = UGen.synthDefContext
    named_control.name = this.toString()
    named_control.rate = 'audio'
    named_control.values = values
    named_control.synthDef.addControl(named_control)
    control = Control.ar()
    // In the context of controls, specialIndex = its index in the control array.
    control.specialIndex = named_control.controlIndex
    return control
}

const createNamedControl = (rate, values) => {
    named_control = Object.create(NamedControl)
    named_control.synthDef = UGen.synthDefContext
    named_control.name = this.toString()
    named_control.rate = rate
    named_control.values = values
    named_control.synthDef.addControl(named_control)
    var control = undefined
    if(rate === 'control') {
        control = Control.kr()
    } else if (rate === 'audio') {
        control = Control.ar()
    } else {
        throw "ERROR: invalid rate"
    }
    control.specialIndex = named_control.controlIndex
    return control
}
// Would ideally use this partial application technique. But I can't get 'this' to do what I want :,(
let createNamedControlKrTEST = createNamedControl.bind(null, 'control')

Reflect.set(String.prototype, 'kr', createNamedControlKr)
Reflect.set(String.prototype, 'ar', createNamedControlAr)