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




