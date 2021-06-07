const {
	UGen,
	MultiOutUGen,
	genBasicUGenDef, 
	genMultiOutUGenDef,
	actionOnUGenMaybeMulti
} = require('./UGen')

const createMultiOutControl = (ugen_type, name, rate, ...args) => {
	if(!ugen_type.isMultiOutUGen) {
		throw new Error(`Attempted to create a MultiOutUGen out of an object that is not a MultiOutUUGen`)
	}
	ugen = Object.create(ugen_type)
	ugen.name = name
	if(args === undefined) {
		ugen.addToGraph(rate,[])
	} else {
		ugen.addToGraph(rate,[])
	}
	var channels = ugen.initOutputs(rate,args.length)
	return channels
}


//var Control = genBasicUGenDef("Control", ['scalar', 'control'])
// var Control = genMultiOutUGenDef(createMultiOutControl, "Control", ['scalar', 'control'],{vals:undefined}) //Broken: see Output Proxy!

var Control = Object.create(MultiOutUGen)
Control.ir = (default_vals) => {
	return actionOnUGenMaybeMulti(createMultiOutControl, [Control, "Control", 'scalar'], default_vals)
}
Control.kr = (default_vals) => {
	return actionOnUGenMaybeMulti(createMultiOutControl, [Control, "Control", 'control'], default_vals)
}

var AudioControl = Object.create(MultiOutUGen)
AudioControl.ar = (default_vals) => {
	return actionOnUGenMaybeMulti(createMultiOutControl, [AudioControl, "AudioControl", 'audio'], default_vals)
}

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
	return createNamedControlKrHelper(this.toString(),values)
}

const createNamedControlKrHelper = function(name, values) {
    named_control = Object.create(NamedControl)
    named_control.synthDef = UGen.synthDefContext
    named_control.name = name
    named_control.rate = 'control'
    named_control.values = values
    named_control.synthDef.addControl(named_control)
    control = Control.kr(values)
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
    control = Control.ir(values)
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
    control = AudioControl.ar(values)
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
