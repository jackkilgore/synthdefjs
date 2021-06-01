# SynthDefJS
[SynthDefJS](https://github.com/jackkilgore/synthdefjs) is a JavaScript library for defining audio graphs compliant with the [SuperCollider](https://github.com/supercollider/supercollider) audio server. It follows from SuperCollider's own [SynthDef construct](http://doc.sccode.org/Classes/SynthDef.html). The hope is that this can be a library that covers [SuperColliderJS's](https://crucialfelix.github.io/supercolliderjs/#/) lack of ability to define SynthDef's in JavaScript. At the very least, SynthDefJS will be a source of inspiration.

## What is Happening?
Concretely, SynthDefJS allows users to express audio graphs through canocial JavaScript function that containts instantiations of UGen objects. This function is then converted to a format that SuperCollider's audio server understands. See the [SupeCollider documentation](http://doc.sccode.org/) for more details.

A simple example:
```JavaScript
let sc = require("synthdefjs")

let def0 = SynthDef('def0', () => {
	let sig = SinOsc.ar(220, 0)
    Out.ar(0, sig)
}).writeToFile("/path/to/synth.scsyndef")
```

An example that allows arguments that can dynamically change the SynthDef using a **named control** style:
```JavaScript
// FM Synth -- Nice
let sc = require("synthdefjs")

let def1 = sc.SynthDef('def6', () => {
	let mod = sc.SinOsc.ar('m_freq'.kr(1))
	mod = sc.MulAdd(mod, 'width'.kr(10), 'c_freq'.kr(220))
    let carrier = sc.SinOsc.ar(mod)
	carrier = sc.BinOp('*', carrier, 'amp'.kr(0.5))
    sc.Out.ar(0, carrier)
})
```

System Diagram where inputs *name* and *JS Func Obj* correspond to the function signature of the above examples:

![](docs/synthdefjs-flow.svg)

## Experimental Features

### Using Babel to Hack Together Operator Overloading 
Notice in the FM Synth example that we are forced to use `sc.MulAdd(.)` and `sc.BinOp(.)` when we want to perform operations on UGens. This is verbose and annoying; it would be more preferrable to just do something like this: 
```JavaScript
// FM Synth using Operator Overloading -- Even Nicer
let sc = require("synthdefjs")

let def2 = sc.SynthDef('def2', () => {
	let mod = sc.SinOsc.ar('m_freq'.kr(1)) * 'width'.kr(10) + 'c_freq'.kr(220)
    let carrier = sc.SinOsc.ar(mod) * 'amp'.kr(0.5)
    sc.Out.ar(0, carrier)
})
```
SynthDefJS is making progress towards the above syntax by dynamically converting arithmetic operations within a SynthDef function into BinOps or BinOp variants using Babel. Unfortunately, this is fragile and poses security risks (it makes the use of `eval(.)` unavoidable). Thus, this is an experimental feature that will continue to improve and will be made optional for any users of the library. 

## Dependencies
- ECMAScript6
- babel/core7 (experimental)
- babel/plugin-transform-arrow-functions (experimental)
- acron (experimental)

## Hopes and Dreams
- [ ] Topological sorting of the audio graph.
- [ ] Graph-aware optimizations of `BinOp(.)`
- [ ] Dynamic, robust operator overloading.
- [ ] Rewriting in TypeScript to better comply with [SuperColliderJS](https://crucialfelix.github.io/supercolliderjs/#/). 
