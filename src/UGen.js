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
        console.log("Generic UGen checkInputs")
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
    obj.name = "%SinOsc.ar"
    obj.addToGraph("audio",freq, phase, mul, add)
    return obj
}

SinOsc.kr = function (freq = 440.0, phase = 0.0, mul = 1.0, add = 0.0) {
    obj = Object.create(SinOsc)
    obj.name = "%SinOsc.kr"
    obj.addToGraph("control",freq, phase, mul, add)
    return obj
}


var Out = Object.create(UGen)

// Uhh, this is starting to bore meeee.
// Should I switch to a new project? I'm not sure if I have time to do that well.
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
    obj.name = "%Out.ar"
    obj.addToGraph("audio", bus, signals)
    return obj
}

Out.kr = function (bus,signals) {
    obj = Object.create(Out)
    obj.name = "%Out.kr"
    out.addToGraph("control", bus, signals)
    return obj
}


var Control = Object.create(UGen)



module.exports = {
	UGen,
    SinOsc,
    Out,
    Control,
}