const {SynthDef} = require('./src/SynthDef')
const {Out, SinOsc} = require('./src/UGen')


// let def0 = SynthDef("def0", () => {
//     let sig = SinOsc.ar(220, 0)
//     Out.ar(0, sig)
// })

// I think I will stick to the named argument style.
let def1 = SynthDef("def1", () => {
    let sig = SinOsc.ar("freq".kr(220), 0)
    let a = Out.ar(0, sig)
}).writeToFile("/Users/jkilgore/Desktop/doi.scsyndef")

// // Figuring out how to deal with BinaryOpUGen
// let def2 = SynthDef("def2", () => {
//     let sig = SinOsc.ar("freq".kr(220), 0, 0.2)
//     let scale_sig = sig //BinaryOpUGen("*",sig, 0.5) // SC way
//     //let scale_sig_1 = MulOpUGen(sig, 0.5) // more specific
//     //let scale_sig_2 = 
//     Out.ar(0,scale_sig)
// })

// Make sure something like this works:
/*
let def3 = SynthDef("def3", () => {
    var freq = "freq".kr(2.0)
    let sig = SinOsc.kr(freq, "amp".kr(0.5), freq)
    let a = Out.ar("out".kr(0), sig)
})
*/

// If you load this file into SC, it works!
//def0.writeToFile("/Users/jkilgore/Desktop/doi.scsyndef")

// If you load this file into SC, it fails silently (literally). 
//console.log(def1.readableSynthDefFile())
//def1.writeToFile("/path/to/scsyndef")
