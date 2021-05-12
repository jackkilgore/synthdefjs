const {SynthDef} = require('./src/SynthDef')
const {Out, SinOsc} = require('./src/UGen')


let def0 = SynthDef("def0",[], () => {
    let sig = SinOsc.ar(220, 0.5)
    Out.ar(0, sig)
})


// This is an unelegant way to pass args. We can't even have non-default'ed args yet!
let def1 = SynthDef("def1",[221,0.4,0], (freq, amp, out) => {
    let sig = SinOsc.ar(freq, amp)
    let a = Out.ar(out, sig)
})