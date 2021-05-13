
const parse = require('./SynthDefParse')

let SynthDef = (name, block) => {
    return {
		add: () => {parse.reflectTest(name, block)},
		play: () => {console.log("play and self reflect")}
	} // a thing on which we may call add
}
  
let Out = {
	ar: (bus, synth) => { return 0 }
}

let SinOsc = {
	ar: (freq, phase = 0, mul = 1, add = 0) => { return 0 }
}

let Done = { freeSelf: 0 }

{
	// Works
	SynthDef("test1", (out, around, the, slough) => {
		var sig = SinOsc.ar(440)
		sig += 1
		Out.ar(out,sig)
	}).add();
	
	// Works
	function test (out, around, the, lagoon) {
		var sig = SinOsc.ar(440)
		sig += 1
		Out.ar(out,sig)
	}
	SynthDef("test2", test).add();

	// Doesn't work for some reason in acorn
	SynthDef("test3", function (out = 1, around = 21, the, bogs) {
		var sig = SinOsc.ar(440)
		Out.ar(out,sig)
	}).add();

}