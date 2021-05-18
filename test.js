const {SynthDef} = require('./src/SynthDef')
const {Out, SinOsc} = require('./src/UGen')


let def0 = SynthDef("def0", () => {
    let sig = SinOsc.ar(220, 0.5)
    Out.ar(0, sig)
})


// let def2_deprecated = SynthDef("def2_deprecated", (freq, amp, out) => {
//     let sig = SinOsc.kr(freq, amp)
//     let a = Out.ar(out, sig)
// })

// I think I will stick to the named argument style.
let def3 = SynthDef("def3", () => {
    let sig = SinOsc.kr("freq".kr(220), "amp".kr(0.5))
    let a = Out.ar("out".kr(0), sig)
})

// Make sure something like this works:
let def4 = SynthDef("def4", () => {
    var freq = "freq".kr(2.0)
    let sig = SinOsc.kr(freq, "amp".kr(0.5), freq)
    let a = Out.ar("out".kr(0), sig)
})

// Testing the retrieval of info needed for the synthdef.
paramValues = []
paramIndicies = []
for(let i = 0; i < def3.controls.length; i++) {
    paramValues.push(def3.controls[i].values)
    let index = {"name": def3.controls[i].name, "index": i}
    paramIndicies.push(index)
}

console.log(paramValues)
console.log(paramIndicies)

ugens = []
for(let i = 0; i < def3.nodes.length; i++) {
    let index = {
        "name": def3.nodes[i].name, 
        "rate": def3.nodes[i].rate, 
        "num_inputs": def3.nodes[i].inputs.length, 
        "num_outputs": 1, 
        "special index": undefined,
        "inputs": [],
        "outputs": []
    }
    for(let j = 0; j < def3.nodes[i].inputs.length; j++) {
        if( Number.isFinite(def3.nodes[i].inputs[j])) {
            let maybe_const_index = def3.constants.indexOf(def3.nodes[i].inputs[j])
            if(maybe_const_index === -1) {
                throw "ERROR: Constant does not exist in the synthdef's constant set."
            }
            index.inputs.push([-1, maybe_const_index]) 
        // if exits in synth nodes, place in inputs. Maybe switch to using maps for nodes. SPEEED
        } else if (def3.nodes.indexOf(def3.nodes[i].inputs[j]) > -1) { 
            index.inputs.push([def3.nodes[i].inputs[j].synthIndex, 0]) // 0 is the output index, 0 if we only have mono outputs
        }
    }
    index.outputs[i].push("audio")
    // for(let j = 0; j < def3.nodes[i].outputs.length; j++) {
    //     index.outputs[i].push(def3.nodes[i].rate)
    // }
    ugens.push(index)
}

console.log(ugens)
