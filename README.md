# synthdefjs
SuperCollider SynthDef in Native Javascript

## TODO

UGen's that have a mul parameter don't actually pass this parameter to the server. The synthdef instead creates a BinOpUgen and multiplies the SinOsc with it. Thus your mul parameters will not work out of the box. Mul and add of Oscillators are just an alias for BinaryOpUGen. We finally have to deal with :((