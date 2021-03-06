let sc = require("./src/include-synthdef")
// let def0 = SynthDef('def0', () => {
//     let sig = SinOsc.ar(220, 0)
//     Out.ar(0, sig)
// })

// I think I will stick to the named argument style.
// let def1 = sc.SynthDef('def1', () => {
//     let sig = sc.SinOsc.ar('freq'.kr(220), 0)
//     let a = sc.Out.ar(0, sig)
// })

// Figuring out how to deal with BinaryOpUGen
// This works!
// let def2 = sc.SynthDef('def2', () => {
//     let sig = sc.SinOsc.ar('freq'.kr(220))
//     let scale_sig = sc.BinOp('*',sig, 0.5)
//     sc.Out.ar(0,scale_sig)
// })

// // Multiplying the amplitude of a sine wave by a sine wave works. Nice.
// let def3 = sc.SynthDef('def3', () => {
//     let sig = sc.SinOsc.ar('freq'.kr(220))
//     let mod = sc.SinOsc.ar(1)
//     let scale_sig = sc.BinOp('*',sig, mod)
//     sc.Out.ar(0,scale_sig)
// }).writeDefFile("/Users/jkilgore/Desktop/doi.scsyndef")


let def4 = sc.SynthDef('def4', () => {
    let sig = sc.SinOsc.ar('freq'.kr(220))
    let scale_sig = sc.BinOp('*',sig, 'amp'.kr(0.5))
    sc.Out.ar(0,scale_sig)
})


let def5 = sc.SynthDef('def5', () => {
	let freq = 'freq'.kr(220)
	let amp = 'amp'.kr(0.5)
    let sig1 = sc.SinOsc.ar(freq)
	let sig2 = sc.SinOsc.ar(sc.BinOp('*',freq,2))
	let scale_sig = sc.BinOp('+', sig1, sig2)
	scale_sig = sc.BinOp('*',scale_sig, 0.5)
    scale_sig = sc.BinOp('*',scale_sig, amp)
    sc.Out.ar(0,scale_sig)
})

// Stereo FM Synth -- Nice
let def6 = sc.SynthDef('def6', () => {
	let c_freq = 'c_freq'.kr(220) // TODO allow this to have multi-channel expansion
	let m_freq = 'm_freq'.kr(1)
	let width = 'width'.kr(10)
	let amp = 'amp'.kr(0.5)
	let mod = sc.SinOsc.ar(Array(2).fill(m_freq)) // stereo propgates through the entire synth
	mod = sc.MulAdd(mod, width, c_freq)
    let carrier = sc.SinOsc.ar(mod)
	carrier = sc.MulAdd(carrier,amp, 0.0) // Should reduce to a BinOp
    sc.Out.ar(0,carrier)
})


/*
let def7 = sc.SynthDef('defmulti', () => {
	let sig = sc.SinOsc.ar(Array(2).fill(440)) // basic multi channel expansion. breaks in most cases
	sc.Out.ar(0,sig)
})

let def8 = sc.SynthDef('defmix', () => {
	let sig = sc.SinOsc.ar(Array(2).fill(220)) // basic multi channel expansion. breaks in most cases
	//sig = sc.Mix(sig)
	sc.Out.ar(0,sig)
})
*/

def_out = def6
def_out.writeDefFile("/Users/jkilgore/Desktop/doi.scsyndef")

/*
let def_out_debug = def_out.readableSynthDefFile()
console.log(def_out_debug)
for(let i = 0; i < def_out_debug.UGens.length; i++) {
	console.log(def_out_debug.UGens[i])
}
*/
