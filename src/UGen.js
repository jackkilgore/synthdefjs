var UGen = {
    synthDefContext: undefined, // Will be defined when a SynthDef is initialized.
    isValidUGenInput: true, // We need to somehow define this value for all objects
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
        console.log(this.inputs)
        for(let i = 0; i < this.inputs.length; i++) {
            // if(!this.inputs[i].isValidUGenInput) {
            //     return false
            // }
        }
        return true
    }
}

var SinOsc = Object.create(UGen)

SinOsc.ar = function (freq = 440.0, phase = 0.0, mul = 1.0, add = 0.0) {
    obj = Object.create(SinOsc)
    // Should we check inputs here?
    obj.addToGraph("audio",freq, phase, mul, add)
    return obj
}

SinOsc.kr = function (freq = 440.0, phase = 0.0, mul = 1.0, add = 0.0) {
    out = Object.create(SinOsc)
    out.addToGraph("control",freq, phase, mul, add)
    return out
}


var Out = Object.create(UGen)

Out.ar = function (bus,signals) {
    out = Object.create(Out)
    out.addToGraph("audio", bus, signals)
    return out
}

Out.kr = function (bus,signals) {
    out = Object.create(Out)
    out.addToGraph("control", bus, signals)
    return out
}

module.exports = {
	UGen,
    SinOsc,
    Out,
}