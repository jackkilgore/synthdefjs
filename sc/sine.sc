SynthDef(\sine, {
    Out.ar(\out.kr(0), SinOsc.ar(\freq.kr(440)) * \amp.kr(0.1));
}).add;