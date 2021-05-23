const {SynthDef} = require('./src/SynthDef')
const {Out, SinOsc} = require('./src/UGen')
const { insertPascalString } = require('./src/Utilities')


let def0 = SynthDef("def0", () => {
    let sig = SinOsc.ar(220, 0, 0.5)
    Out.ar(0, sig)
})

// Flaw: Default functions values are loaded into the synthDefFile as constants.
// Same with the namedControl arguments. SC does not do this.

// Fixed the named control part.

// I think I will stick to the named argument style.
let def1 = SynthDef("def1", () => {
    let sig = SinOsc.ar("freq".kr(220), 0, "amp".kr(0.2))
    let a = Out.ar(0, sig)
})

// Make sure something like this works:
/*
let def2 = SynthDef("def2", () => {
    var freq = "freq".kr(2.0)
    let sig = SinOsc.kr(freq, "amp".kr(0.5), freq)
    let a = Out.ar("out".kr(0), sig)
})
*/
// If you load this file into SC, it works!
// Notice that SC implicitly uses BinOp instead of the mul param.
//  The sclang SinOsc only had 2 params: (freq, phase)
//def0.writeToFile("/Users/jkilgore/Desktop/doi.scsyndef")

// If you load this file into SC, it fails silently (literally).
// TODO: DEBUG; The way we handle controls is flawed. 
//console.log(def1.readableSynthDefFile())
def1.writeToFile("/Users/jkilgore/Desktop/doi.scsyndef")
