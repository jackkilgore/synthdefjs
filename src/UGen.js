const {isArray} = require('./Utilities')


var UGen = {
    synthDefContext: undefined, // Will be defined when a SynthDef is initialized.
    isValidUGenInput: true, // We need to somehow define this value for all objects
    name: "UGen",
    addToGraph: function(rate, ...args) {
        this.synthDef = undefined
        this.synthIndex = undefined
        this.rate = rate
        this.inputs = args
    
        console.log("Construcing UGen into SynthDef...")
    
        this.addToSynthDef()
    
    },
    addToSynthDef: function() {
        this.synthDef = UGen.synthDefContext
        if(this.synthDef != undefined) {
           this.synthDef.addNode(this)
        }
    },
    checkInputs: function() {
        return this.checkValInputs()
    },
    checkValInputs: function() {
        console.log(`Generic UGen checkInputs of ${this.name}`)
        for(let i = 0; i < this.inputs.length; i++) {
            if(!this.inputs[i].isValidUGenInput && !Number.isFinite(this.inputs[i])
                && !isArray(this.inputs[i])) 
            {
                return false
            }
        }
        return true
    }
}

var SinOsc = Object.create(UGen)


SinOsc.ar = function (freq = 440.0, phase = 0.0, mul = 1.0, add = 0.0) {
    obj = Object.create(SinOsc)
    obj.name = "SinOsc"
    obj.addToGraph("audio",freq, phase, mul, add)
    return obj
}

SinOsc.kr = function (freq = 440.0, phase = 0.0, mul = 1.0, add = 0.0) {
    obj = Object.create(SinOsc)
    obj.name = "SinOsc"
    obj.addToGraph("control",freq, phase, mul, add)
    return obj
}


var Out = Object.create(UGen)

Out.checkInputs = function() {
    console.log("Outs Check Inputs...")
    if(this.rate === "audio") {
        for(let i = 0; i < this.inputs[1]; i++) {
            if(this.inputs[i].rate != "audio") {
                console.log("Inputs to Out not at the audio rate.")
                return false
            }
        }
    }
    if(this.inputs.length < 2) {
        console.log("Out does not have enough inputs.")
        return false
    }

    return this.checkValInputs()
}

Out.ar = function (bus,signals) {
    obj = Object.create(Out)
    obj.name = "Out"
    obj.addToGraph("audio", bus, signals)
    return obj
}

Out.kr = function (bus,signals) {
    obj = Object.create(Out)
    obj.name = "Out"
    out.addToGraph("control", bus, signals)
    return obj
}

var Control = Object.create(UGen)

Control.kr = function(values) {
    obj = Object.create(Control)
    obj.name = "Control"
    obj.isControlUGen = true
    obj.addToGraph("control", values)
    return obj
}

Control.ar = function(values) {
    obj = Object.create(Control)
    obj.name = "Control"
    obj.isControlUGen = true
    obj.addToGraph("audio", values)
    return obj
}

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
    return Control.kr(values)
}

function createNamedControlAr(values) {
    obj = Object.create(NamedControl)
    obj.synthDef = UGen.synthDefContext
    obj.name = this.toString()
    obj.rate = 'audio'
    obj.values = values
    obj.synthDef.addControl(obj)
    return Control.ar(values)
}

Reflect.set(String.prototype, 'kr', createNamedControlKr)
Reflect.set(String.prototype, 'ar', createNamedControlAr)



module.exports = {
	UGen,
    SinOsc,
    Out,
    Control,
}