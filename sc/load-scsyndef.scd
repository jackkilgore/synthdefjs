s.sendMsg("/d_load", "/Users/jkilgore/Desktop/doi.scsyndef");


(
c = SynthDef(\def0,{
    var sig = SinOsc.ar(220, 0, 0.5);
    Out.ar(0, sig);
}).asBytes.printOn(Post); nil
)



x = Synth(\def0);


(
c = SynthDef(\def1,{
	var sig = SinOsc.ar(\freq.kr(220));
    Out.ar(0, sig);
}).asBytes.printOn(Post); nil
)


y = Synth(\def1, [freq: 200]);



Int8Array[
	// header
	83, 67, 103, 102, 0, 0, 0, 2, 0, 1,
	// name
	4, 100, 101, 102, 49,
	// Number of constants
	0, 0, 0, 1, // notice that it doesn't count the default value of freq as a constant
	0, 0, 0, 0, // constant: 0 corresponding to first input of Out.ar
	0, 0, 0, 1, // number of parameters
	67, 92, 0, 0, // init val of param 1
	0, 0, 0, 1, // number of names params
	4, 102, 114, 101, 113, //param 1 name: freq
	0, 0, 0, 0, // param 1 index (0)
	0, 0, 0, 3, // Number of UGens
	7, 67, 111, 110, 116, 114, 111, 108, // Name of first UGen (Control)
	1, // 1. Calculation rate (control)
	0, 0, 0, 0, // 1. Number of inputs
	0, 0, 0, 1, // 1. Number of outputs
	0, 0, // 1. special index
	1, // 1. 0th output rate
	6, 83, 105, 110, 79, 115, 99, // 2. Ugen Name (SinOsc)
	2, // 2. rate (audio)
	0, 0, 0, 2, // num inputs
	0, 0, 0, 1, // num outputs
	0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, 0, 0, 0, 0, 2, 3, 79, 117, 116, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0 ]-> nil
