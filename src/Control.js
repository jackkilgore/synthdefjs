const {
	UGen,genBasicUGenDef, 
	genBasicMultiOutUGenDef,
	actionOnUGenMaybeMulti
} = require('./UGen')

var Control = genBasicUGenDef("Control", ['scalar', 'control'])
//var Control = genBasicMultiOutUGenDef("Control", ['scalar', 'control'],2) Broken: see Output Proxy!
var AudioControl = genBasicUGenDef("AudioControl", ['audio'])

// Named Controls. Forcing users to use this.
var NamedControl = {
    name: "",
    rate: "control",
    values: [],
    synthDef: undefined,
    controlIndex: undefined,
}

// It gets instantiated correctly, but doesn't work as a parameter
// We need multi-output UGens
const createNamedControlKr = function(values) {
	return actionOnUGenMaybeMulti(createNamedControlKrHelper, [this.toString()], [values])
}

const createNamedControlKrHelper = function(name, values) {
    named_control = Object.create(NamedControl)
    named_control.synthDef = UGen.synthDefContext
    named_control.name = name
    named_control.rate = 'control'
    named_control.values = values
    named_control.synthDef.addControl(named_control)
    control = Control.kr()
    control.specialIndex = named_control.controlIndex
    return control
}

const createNamedControlIr = function(values) {
	return actionOnUGenMaybeMulti(createNamedControlIrHelper, [this.toString()], [values])
}
const createNamedControlIrHelper = function(name, values) {
    named_control = Object.create(NamedControl)
    named_control.synthDef = UGen.synthDefContext
    named_control.name = name
    named_control.rate = 'scalar'
    named_control.values = values
    named_control.synthDef.addControl(named_control)
    control = Control.ir()
    control.specialIndex = named_control.controlIndex
    return control
}

const createNamedControlAr = function(values) {
	return actionOnUGenMaybeMulti(createNamedControlArHelper, [this.toString()], [values])
}
const createNamedControlArHelper = function(name, values) {
    named_control = Object.create(NamedControl)
    named_control.synthDef = UGen.synthDefContext
    named_control.name = name
    named_control.rate = 'audio'
    named_control.values = values
    named_control.synthDef.addControl(named_control)
    control = AudioControl.ar()
    // In the context of controls, specialIndex = its index in the control array.
    control.specialIndex = named_control.controlIndex
    return control
}

const createNamedControlHelper = (rate, name, values) => {
    named_control = Object.create(NamedControl)
    named_control.synthDef = UGen.synthDefContext
    named_control.name = name
    named_control.rate = rate
    named_control.values = values
    named_control.synthDef.addControl(named_control)
    var control = undefined
    if(rate === 'control') {
        control = Control.kr()
    } else if (rate ==='scalar') {
		control = Control.ir()
	} else if (rate === 'audio') {
        control = AudioControl.ar()
    } else {
        throw new Error("invalid rate")
    }
    control.specialIndex = named_control.controlIndex
    return control
}
// Would ideally use this partial application technique. But I can't get 'this' to do what I want :,(
let createNamedControlKrTEST = createNamedControlHelper.bind(null, 'control')

Reflect.set(String.prototype, 'kr', createNamedControlKr)
Reflect.set(String.prototype, 'ir', createNamedControlIr)
Reflect.set(String.prototype, 'ar', createNamedControlAr)
