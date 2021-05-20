const {SynthDef} = require('./src/SynthDef')
const {Out, SinOsc} = require('./src/UGen')
const { insertPascalString } = require('./src/Utilities')


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


let def3Format = def3.readableSynthDefFile()

console.log(def3)

let def3Bytes = def3.writeSynthDefFile()

