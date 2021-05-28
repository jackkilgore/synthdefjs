const {isArray} = require('./Utilities')


var UGen = {
    synthDefContext: undefined, // Will be defined when a SynthDef is initialized.
    isValidUGenInput: true, // We need to somehow define this value for all objects
    specialIndex: 0,
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
/*
 * Generate a basic UGen def with .ar, .kr, and .ir methods. 
 * 
 * name : The name of the UGen 
 * rates: an array of strings where each string is audio | control | scalar. 
 *      - Generates a ".ar", ".kr", and ".ir" for t he returned object, respectively.
 * sign_args: A dictionary denoting the signature of the ".ar", ".kr", and ".ir" functions. 
 *      - Of the format {input1: default_value, input2: default_value} 
 *      - If there is no default value, use keyword "undefined"
 * 
 * Example: 
 * var Test = genBasicUGenDef("Test", 
 *              ["audio, control], // will genrate a ".ar" and ".kr" method
 *              {
 *               input1: undefined, // Required argument for ".ar" and ".kr" method
 *               input2: 220        // Optional argument that defaults to 220
 *              }
 *             )
 * 
 */
function genBasicUGenDef(name, rates, sign_args) {
    var output = Object.create(UGen)

    let test = (rate, ...inst_args) => {
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
        obj.addToGraph(rate,inst_args)
        return obj
    }

    if(rates.indexOf("audio") !== -1) {
        output.ar = (...inst_args) => {
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
        output.kr = (...inst_args) => {
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
            obj.addToGraph("control",inst_args)
            return obj
        }
    }

    if (rates.indexOf("scalar") !== -1) {
        output.ir = (...inst_args) => {
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
            obj.addToGraph("scalar",inst_args)
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

module.exports = {
	UGen,
    genBasicUGenDef,
    SinOsc,
    Out,
}