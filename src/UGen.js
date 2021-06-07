const {isArray} = require('./Utilities')


var UGen = {
    synthDefContext: undefined, // Will be defined when a SynthDef is initialized.
    isValidUGenInput: true, // We need to somehow define this value for all objects
	isUGen: true,
    specialIndex: 0,
	outputIndex: 0,
    name: "UGen",
	numOutputs: () => {return 1},
    addToGraph: function(rate, args) {
        this.synthDef = undefined
        this.synthIndex = undefined
        this.rate = rate
        this.inputs = args
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
        for(let i = 0; i < this.inputs.length; i++) {
            if(!this.inputs[i].isValidUGenInput && !Number.isFinite(this.inputs[i])
                && !isArray(this.inputs[i])) 
            {
            	throw new Error(`Generic UGen checkInputs of ${this.name} failed.`)
            }
        }
        return true
    }
}

var MultiOutUGen = Object.create(UGen)
MultiOutUGen.isMultiOutUGen = true
MultiOutUGen.channels = new Array()
MultiOutUGen.initOutputs = function(rate, num_channels) {
	for (let i = 0; i < num_channels; i++) {
		if(rate === 'audio' || rate === 'control' || rate === 'scalar') {
			this.channels.push(OutputProxy.init(rate, this, i))
		} else {
			throw new Error(`Invalid rate.`)
		}
	}
	return this.channels
}
MultiOutUGen.numOutputs = function() {return this.channels.length}

// UGEN_TYPE MUST DERIVE FROM THE UGEN OBJECT
const createUGen = (ugen_type, name, rate,...args) => {
	if(!ugen_type.isUGen) {
		throw new Error(`Attempted to create a UGen out of an object that is not a UGen`)
	}
	ugen = Object.create(ugen_type)
	ugen.name = name
	if(args === undefined) {
		ugen.addToGraph(rate,[])
	} else {
		ugen.addToGraph(rate,args)
	}
	return ugen
}

const createMultiOutUGen = (ugen_type, name, rate, channels, ...args) => {
	if(!ugen_type.isMultiOutUGen) {
		throw new Error(`Attempted to create a MultiOutUGen out of an object that is not a MultiOutUUGen`)
	}
	ugen = Object.create(ugen_type)
	ugen.name = name
	if(args === undefined) {
		ugen.addToGraph(rate,channels,[])
	} else {
		ugen.addToGraph(rate,channels,args)
	}
	ugen.initOutputs(rate,channels)
	return ugen
}

// this is suppose to be recursive
function actionOnUGenMaybeMulti(action,const_pre_args, inputs) {
	// figure out multichannel expansion
	// Should probably be in a new function
	// Maybe have a fn not aware of UGen, so it can figure out how many UGens to make
	let num_ugens = 0
	for (let i = 0; i < inputs.length; i++) {
		if(isArray(inputs[i])) {
			num_ugens = Math.max(inputs[i].length, num_ugens)	
		}
	}

	// No array of arguments found. return one UGen
	if(num_ugens === 0) {
		return action.apply(this, const_pre_args.concat(inputs))
	}
	
	let multi_ugens = new Array(num_ugens)
	for( let i = 0; i < num_ugens; i++) {
		let temp_args = new Array(inputs.length)
		for (let j = 0; j < inputs.length; j++) {
			if (isArray(inputs[j])) {
				temp_args[j] = inputs[j][i % inputs[j].length]
			} else {
				temp_args[j] = inputs[j]
			}
		}
		multi_ugens[i] = actionOnUGenMaybeMulti(action,const_pre_args,temp_args)	
	}
	return multi_ugens
}

// The goal: disgusting JS
// We can try using eval here for calling .ar or something, if we want to be extra evil
    // not a security risk if we don't expose this eval to a function argument
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
			let invalid_signature_message = 
				`UGen has signature (${Object.keys(sign_args)}), but passed ${inst_args.length} arguments.` 
            throw new Error(invalid_signature_message)
        }
    	return actionOnUGenMaybeMulti(createUGen, [output,name,'audio'], inst_args)
        // Create object and add to the graph.
		/*
        obj = Object.create(output)
        obj.name = name
        obj.addToGraph("audio",inst_args)
        return obj
		*/
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
				let invalid_signature_message = 
					`UGen has signature (${Object.keys(sign_args)}), but passed ${inst_args.length} arguments.` 
				throw new Error(invalid_signature_message)
            }
    		return actionOnUGenMaybeMulti(createUGen, [output,name,'control'], inst_args)
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
				let invalid_signature_message = 
					`UGen has signature (${Object.keys(sign_args)}), but passed ${inst_args.length} arguments.` 
				throw new Error(invalid_signature_message)
            }
            
    		return actionOnUGenMaybeMulti(createUGen, [output,name,'scalar'], inst_args)
        }
    }
    
    return output
}


function genMultiOutUGenDef(constructor_fn, name, possible_rates, ugen_signature) {
    var output = Object.create(MultiOutUGen)
	const call_ugen = (rate, ...ugen_input) => {
			// Insert default arguments if necessary.
			let arg_count = 0
			for (let key in ugen_signature) {
				if(typeof ugen_input[arg_count]  === 'undefined') {
					ugen_input[arg_count] = ugen_signature[key]
				}
				arg_count += 1
			}

			// Check if we have a valid signature
			if(ugen_input.length !== arg_count) {
				let invalid_signature_message = 
					`UGen has signature (${Object.keys(ugen_signature)}), but passed ${ugen_input.length} arguments.` 
				throw new Error(invalid_signature_message)
			}
			return actionOnUGenMaybeMulti(constructor_fn, [output,name,rate, ugen_input], [])
    }

	for ( let i = 0; i < possible_rates.length; i++) {
		let rate = possible_rates[i]
		if(rate === 'scalar') {
			output.ir = (...inst_args) => {return call_ugen.apply(this,['scalar'].concat(inst_args))}
		} else if (rate === 'control') {
			output.kr = (...inst_args) => {return call_ugen.apply(this,['control'].concat(inst_args))}
		} else if (rate === 'audio') {
			output.ar = (...inst_args) => {return call_ugen.apply(this, ['audio'].concat(inst_args))}
		}
	}
    
    return output
}

var SinOsc = genBasicUGenDef("SinOsc", ["audio", "control"], {freq: 440.0, phase: 0.0})

// Out is a special case since must destructure the signals array
var Out = Object.create(UGen)
Out.ar = (bus, signals) => {
	return actionOnUGenMaybeMulti(createUGen, [Out, "Out", 'audio'], [bus].concat(signals))
}
Out.kr = (bus, signals) => {
	return actionOnUGenMaybeMulti(createUGen, [Out, "Out", 'control'], [bus].concat(signals))
}
// Overload checkInputs for Out
Out.checkInputs = function() {
    if(this.rate === "audio") {
        for(let i = 0; i < this.inputs[1]; i++) {
            if(this.inputs[i].rate != "audio") {	
                throw new Error(`Out UGen is at the audio rate but it's inputs are not.`)
            }
        }
    }
    if(this.inputs.length < 2) {
		throw new Error("Out does not have enough inputs (at least 2).")
    }

    return this.checkValInputs()
}

var OutputProxy = Object.create(UGen)
OutputProxy.name = "OutputProxy"
OutputProxy.init = function (rate, sourceUGen, index) {
	var ugen = Object.create(OutputProxy)
	ugen.name = "OutputProxy"
	if(rate === 'audio' || rate === 'control' || rate === 'scalar') {
		ugen.rate = rate
	} else {
		throw new Error("Invalid rate.")
	}
 	ugen.synthDef = sourceUGen.synthDef
    ugen.synthIndex = sourceUGen.synthIndex
	ugen.outputIndex = index
	return ugen
}

module.exports = {
	UGen,
    genBasicUGenDef,
	genMultiOutUGenDef,
	actionOnUGenMaybeMulti,
    SinOsc,
    Out,
	MultiOutUGen,
}
