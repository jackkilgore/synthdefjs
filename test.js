const {SynthDef} = require('./src/SynthDef')
const {Out, SinOsc} = require('./src/UGen')


let def0 = SynthDef("def0", () => {
    let sig = SinOsc.ar(220, 0.5)
    Out.ar(0, sig)
})


// This is an unelegant way to pass args. We can't even have non-default'ed args yet!
let def1 = SynthDef("def1", (freq = 220, amp = 0.5, out = 0) => {
    let sig = SinOsc.kr(freq, amp)
    let a = Out.ar(out, sig)
})

// console.log(def1.children[1].inputs[1])
// console.log(def1.children[1].inputs[1].isValidUGenInput)