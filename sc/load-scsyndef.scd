s.sendMsg("/d_load", "/path/to/scsyndef");


(
c = SynthDef(\def0,{
    var sig = SinOsc.ar(220, 0, 0.5);
    Out.ar(0, sig);
}).asBytes.printOn(Post); nil
)



x = Synth(\def0);

y = Synth(\def1, [amp: 0.5]);