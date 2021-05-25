const {isArray} = require('./Utilities')


var UGen = {
    synthDefContext: undefined, // Will be defined when a SynthDef is initialized.
    isValidUGenInput: true, // We need to somehow define this value for all objects
    name: "UGen",
    addToGraph: function(rate, args) {
        this.synthDef = undefined
        this.synthIndex = undefined
        this.rate = rate
        this.inputs = args
        console.log("TODO: assert that args is an array in addToGraph")
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

// The goal: disgusting JS
function genBasicUGenDef(name, rates, sign_args) {
    var output = Object.create(UGen)

    if(rates.indexOf("audio") !== -1) {
        output.ar = function(...inst_args) {

            // Insert default arguments if necessary.
            let arg_count = 0
            for (let key in sign_args) {
                if(typeof inst_args[arg_count]  === 'undefined') {
                    inst_args[arg_count] = sign_args[key]
                }
                arg_count += 1
            }

            // Check if we have a valid signature
            if(inst_args.length !== arg_count) {
                console.error(`INVALID input: function has signature (${Object.keys(sign_args)})`)
                throw "ERROR: Invalid function signature"
            }
            
            // Create object and add to the graph.
            obj = Object.create(output)
            obj.name = name
            obj.addToGraph("audio",inst_args)
            return obj
        }
    }

    if (rates.indexOf("control") !== -1) {
        output.kr = function(...inst_args) {
            let arg_count = 0
            for (let key in sign_args) {
                if(typeof inst_args[arg_count]  === 'undefined') {
                    inst_args[arg_count] = sign_args[key]
                }
                arg_count += 1
            }
            if(inst_args.length !== arg_count) {
                console.error(`INVALID input: function has signature (${Object.keys(sign_args)})`)
                throw "ERROR: Invalid function signature"
                
            }
    
            obj = Object.create(output)
            obj.name = name
            obj.addToGraph("control",inst_args)
            return obj
        }
    }
    
    return output
}

var SinOsc = genBasicUGenDef("SinOsc", ["audio", "control"], {freq: 440.0, phase: 0.0})

var Out = genBasicUGenDef("Out", ["audio", "control"], {bus: undefined, signals: undefined})

// Overload checkInputs for Out

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



module.exports = {
	UGen,
    SinOsc,
    Out,
    Control,
}