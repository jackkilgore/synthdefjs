let sc = require("./src/include-synthdef")


// let def0 = SynthDef("def0", () => {
//     let sig = SinOsc.ar(220, 0)
//     Out.ar(0, sig)
// })

// I think I will stick to the named argument style.
// let def1 = sc.SynthDef("def1", () => {
//     let sig = sc.SinOsc.ar("freq".kr(220), 0)
//     let a = sc.Out.ar(0, sig)
// })

// Figuring out how to deal with BinaryOpUGen
// This works!
// let def2 = sc.SynthDef("def2", () => {
//     let sig = sc.SinOsc.ar("freq".kr(220))
//     let scale_sig = sc.BinOp("*",sig, 0.5)
//     sc.Out.ar(0,scale_sig)
// })

// // Multiplying the amplitude of a sine wave by a sine wave works. Nice.
// let def3 = sc.SynthDef("def3", () => {
//     let sig = sc.SinOsc.ar("freq".kr(220))
//     let mod = sc.SinOsc.ar(1)
//     let scale_sig = sc.BinOp("*",sig, mod)
//     sc.Out.ar(0,scale_sig)
// }).writeToFile("/Users/jkilgore/Desktop/doi.scsyndef")

let def4 = sc.SynthDef("def4", () => {
    let sig = sc.SinOsc.ar("freq".kr(220))
    let scale_sig = sc.BinOp("*",sig, "amp".kr(0.5))
    sc.Out.ar(0,scale_sig)
}).readableSynthDefFile()//.writeToFile("/Users/jkilgore/Desktop/doi.scsyndef")
console.log(def4)