# synthdefjs
SuperCollider SynthDef in Native Javascript

## TODO
25052021
- [x] NamedControl's break sc.BinOp
- [ ] Need a way to parse BinOp operator into a special index. 
    - big look up table?

22052021
- UGen's that have a mul parameter don't actually pass this parameter to the server. The synthdef instead creates a BinOpUgen and multiplies the SinOsc with it. Thus your mul parameters will not work out of the box. Mul and add of Oscillators are just an alias for BinaryOpUGen. We finally have to deal with :((