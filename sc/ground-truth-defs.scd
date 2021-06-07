(
SynthDef(\def4, {
	var sig = SinOsc.ar(\freq.kr(220));
	var scale_sig = BinaryOpUGen('*',sig, \amp.kr(0.5));
    Out.ar(0,scale_sig);
})
)

(
SynthDef(\def5, {
	var freq = \freq.kr(220);
	var sig1 = SinOsc.ar(BinaryOpUGen('*', freq, 2));
    Out.ar(0,sig1)
})
)

(
SynthDef('defMultiOut', {
	var sig = BinaryOpUGen('*',SinOsc.ar('freqs'.kr([220,440])), 0.5);
	Out.ar(0,sig);
})
)

(
SynthDef('outputProxy', {
	'freq'.kr([220,440])
}).writeDefFile("/Users/jkilgore/Desktop/")

)s
