s.sendMsg("/d_load", "/Users/jkilgore/Desktop/doi.scsyndef");


(
c = SynthDef(\def0,{
    var sig = SinOsc.ar(220, 0, 0.5);
    Out.ar(0, sig);
}).asBytes.printOn(Post); nil
)



x = Synth(\def0);

y = Synth(\def1, [freq:440]);

z = Synth(\def3, [freq:220]);

(
SynthDef(\def4, {
	var sig = SinOsc.ar(\freq.kr(220));
	var scale_sig = BinaryOpUGen('*',sig, \amp.kr(0.5));
    Out.ar(0,scale_sig);
}).writeDefFile("/Users/jkilgore/Desktop")
)

a = Synth(\def4, [freq:440, amp:0.2]);

(
SynthDef(\def5, {
	var freq = \freq.kr(220)
	var amp = \amp.kr(0.5)
	var sig1 = SinOsc.ar(BinOp('*', freq, 1))
	var sig2 = SinOsc.ar(440)
	var scale_sig = BinOp('+', sig1, sig2)
	scale_sig = BinOp('*',scale_sig, 0.5)
	scale_sig = BinOp('*',scale_sig, amp)
    Out.ar(0,scale_sig)
})

a = Synth(\def5, [freq:220, amp:0.5]);


(
c = SynthDef(\def1,{
	var sig = SinOsc.ar(\freq.kr(220),mul:\amp.kr(0.2));
    Out.ar(0, sig);
}).asBytes.printOn(Post); nil
)
Int8Array[
	83, 67, 103, 102, 0, 0, 0, 2, 0, 1,
	// Name of Ugen
	4, 100, 101, 102, 49,
	// Num of constants
	0, 0, 0, 1,
	// constants.0
	0, 0, 0, 0,
	// Num params
	0, 0, 0, 2,
	// Param default values
	67, 92, 0, 0,
	62, 76, -52, -51,
	// Num params
	0, 0, 0, 2,
	// Param names and index
	4, 102, 114, 101, 113,
	0, 0, 0, 0,

	3, 97, 109, 112,
	0, 0, 0, 1,
	// Num UGens
	0, 0, 0, 5,

	// UGen 1 - Control freq
	7, 67, 111, 110, 116, 114, 111, 108, // name
	1, // calc rate
	0, 0, 0, 0, // num of inputs
	0, 0, 0, 1, // num outputs
	0, 0, // special index
	1, // output.0 rate

	// UGen 2 - SinOsc
	6, 83, 105, 110, 79, 115, 99, // name
	2, // rate
	0, 0, 0, 2, // num inputs
	0, 0, 0, 1, // num outputs
	0, 0, // special index
	// input-spec.0
	0, 0, 0, 0, // Control at index 0 is its input for first param
	0, 0, 0, 0, // 0th output
	// input-spec.1
	-1, -1, -1, -1, // constant input
	0, 0, 0, 0, // constant index
	// output-spec.0
	2, // out rate (audio

	// UGen 3 - Control amp
	7, 67, 111, 110, 116, 114, 111, 108,
	1,
	0, 0, 0, 0,
	0, 0, 0, 1,
	0, 1, // Special index is 1!! Wut does it mean?
	// output-spec.0
	1, // rate

	// BinaryOpUGen
	12, 66, 105, 110, 97, 114, 121, 79, 112, 85, 71, 101, 110,
	2, // rate
	0, 0, 0, 2, // num of inputs
	0, 0, 0, 1, // num of outputs
	0, 2, // special index is 2!! What does it mean? Maybe that we are multiplying?
	0, 0, 0, 1, // First input is the SinOsc at index 1
	0, 0, 0, 0, // use the output.0
	0, 0, 0, 2, // Second input is the Control at index 2
	0, 0, 0, 0, // use output.0
	// output-spec.0
	2, // rate

	// Out
	3, 79, 117, 116,
	2,
	0, 0, 0, 2,
	0, 0, 0, 0,
	0, 0,
	-1, -1, -1, -1,
	0, 0, 0, 0,
	0, 0, 0, 3, // Input is BinOpUgen from earlier
	0, 0, 0, 0, // out output.0

	// variant is 0
	0, 0

]-> nil


Int8Array[ 83, 67, 103, 102, 0, 0, 0, 2, 0, 1, 4, 100, 101, 102, 49, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 67, 92, 0, 0, 62, 76, -52, -51, 0, 0, 0, 2, 4, 102, 114, 101, 113, 0, 0, 0, 0, 3, 97, 109, 112, 0, 0, 0, 1, 0, 0, 0, 5, 7, 67, 111, 110, 116, 114, 111, 108, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 6, 83, 105, 110, 79, 115, 99, 2, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, 0, 0, 0, 0, 2, 7, 67, 111, 110, 116, 114, 111, 108, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 12, 66, 105, 110, 97, 114, 121, 79, 112, 85, 71, 101, 110, 2, 0, 0, 0, 2, 0, 0, 0, 1, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 3, 79, 117, 116, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0 ]-> nil

