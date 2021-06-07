(
b = SynthDef(\help_Control, { | freq = 200, amp = 0.5 |

	var sig = SinOsc.ar(freq) * amp;
	Out.ar(0, sig)

}).store
);

SynthDescLib.global.browse;

a.desc.outputData;


a.metadata[\specs]

a.allControlNames()

// synonym:
(
SynthDef(\help_Control, {

    \freq.kr(200).inspect; // at the time of compiling the def

}).specs
);


(
a = {
	|x|
	var b = x * x;
	b // explicit return statement
};
)

a.value(3)

b.writeDefFile("/Users/jkilgore/Desktop/", true);

UGen.writeDefFile

f = File.new("/Users/jkilgore/Desktop/test.txt", "w+");

SinOsc.asArray.writeDefFile(f);

.putPascalString

.putString

.valueArray

(
f = { | freq = 200, amp = 0.5 |

	var sig = SinOsc.ar(freq) * amp;
	Out.ar(0, sig);
	10

}
)

f.valueArray(200,0.5);

(
b = SynthDef(\help_Control, { | freq = 200, amp = 0.5 |

	var sig = SinOsc.ar(freq) * amp;
	Out.ar(0, sig)

})
)

// static var in class?
classvar

//
UGen.new()


// BinaryOpUGen
d = BinaryOpUGen('*', a, b)
d.specialIndex



//

(
f = {|a b| a * b};
b = SynthDef(\test, { | freq = 200, amp = 0.5 |

	var sig = f.(SinOsc.ar(freq), amp);
	Out.ar(0, sig)

}).add()
)

Synth(\test,[amp:0.1])


SinOsc.ar([220,120]).postln

Pan2.ar(120)
DC.ar(2)

OutputProxy


(
f = {|a b| a * b};
b = SynthDef(\test, { | amp = 0.5 |
	var freqs = \freqs.kr([220,440]);
	var sig = f.(SinOsc.ar(freqs), amp);
	freqs.postln;
	Out.ar(0, sig)

}).add()
)

Synth(\test, [freqs:[120,220]])

(
b = SynthDef(\test, {
	var ctrl = 'freq'.kr([220,440]);
})
)


Mix.new()

[2,3,4].asArray.clump(4)