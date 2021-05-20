const {SynthDef} = require('./src/SynthDef')
const {Out, SinOsc} = require('./src/UGen')
const { insertPascalString } = require('./src/Utilities')


let def0 = SynthDef("def0", () => {
    let sig = SinOsc.ar(220, 0, 0.5)
    Out.ar(0, sig)
})

// I think I will stick to the named argument style.
let def1 = SynthDef("def1", () => {
    let sig = SinOsc.kr("freq".kr(220), 0, "amp".kr(0.5))
    let a = Out.ar("out".kr(0), sig)
})

// Make sure something like this works:
let def2 = SynthDef("def2", () => {
    var freq = "freq".kr(2.0)
    let sig = SinOsc.kr(freq, "amp".kr(0.5), freq)
    let a = Out.ar("out".kr(0), sig)
})

// If you load this file into SC, it works!
// Notice that SC implicitly uses BinOp instead of the mul param.
//  The sclang SinOsc only had 2 params: (freq, phase)
//def0.writeToFile("/path/to/scsyndef")

// If you load this file into SC, it fails silently (literally).
// TODO: DEBUG; The way we handle controls is flawed. 
//def1.writeToFile("/path/to/scsyndef")

