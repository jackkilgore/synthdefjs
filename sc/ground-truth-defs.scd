(
SynthDef(\def4, {
	var sig = SinOsc.ar(\freq.kr(220));
	var scale_sig = BinaryOpUGen('*',sig, \amp.kr(0.5));
    Out.ar(0,scale_sig);
}).writeDefFile("/Users/jkilgore/Desktop")
)