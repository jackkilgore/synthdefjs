# synthdefjs
SuperCollider SynthDef in Native Javascript

## TODO
01062021
WORKING ON BABEL AND OP OVERLOADING
- [ ] elegant errors
- [ ] stop duplication of inline fn definitions of nested fns.
- [ ] implement a "keyword" at the top of all synthdef functions
	- this will be an alternative to forcing users to prepend functions with SC_
- [ ] do rigorous testing of the babel op overloading
- [ ] add operators for stuff like 'pow' 
- [ ] make the anonymous function syntax work with babel
- [ ] grab root node of AST ONLY once when parsing
- [ ] make sure that your method for grabbing the function body is resiliant against different syntaxes

30052021
- [ ] look into babel resolvers for cleaner imports
- [ ] OK, I can manage to do operator overloading using Babel
	- however, to do this dynamically (eg not writing to an intermediate file), I must use eval
	- even worse, this eval is inteneded to be done on an arbitrary function passed to SynthDef
	- how bad of a security issue is this? 
	- I'm thinking of making this operator overloading feature optional, due to the risks
- [x] Big problem with scoping and operator overloading with Babel 
	- we need to convert `sc.SinOsc.ar() * 0.5` to `sc.BinOp(sc.SinOsc.ar(), 0.5)` 
	- how do we get the `sc`? This is an arbitrary value set using `const sc = require("include-synthdefjs")`
	- Babel needs an object instance variable name that is set by a user arbitrarily. HOW?
	- best idea so far: force funcGraph to be aware of all the same methods available in SynthDef.js
		- let us see if this is possible
		- I can use an `eval` *faceplam*
			- this breaks modularity and makes user defined functions unusable, NEXT
- [ ] another problem...babel cant parse this synatx: `let fun = function() {}`
- [x] another problem...arrow functions `this` are perma-binded to the parent scope...
	- can't dynamically allow a funcGraph to be aware of `this.BinOp`... sad
Ok I have a first working version of using babel to dynamically conver operators to BinOps ONLY WITHIN a SynthDef context. This is how it works.  

Babel goes through a function (funcGraph) and replaces all BinaryExpressions with `this.BinOp(op, lhs, rhs)`. Since we are doing this in a babel ATS, it seems to maintain associativity...nice. The reason we use `this` is so that we can dynamically bind the `this` of `SynthDefTemplate` to our funcGraph. We set `this` of `SyntDefTemplate` to conatin the BinOp function defined in the `OpUGens` file.

Ok, this is great, but there are some issues. First, Babel throws a syntax error when you pass non-arrow anonymous functions. This is unacceptable.

In order to bind `this` dynamically, we must use babel `transform-arrow-functions` to convert from arrow functions (which have immutable `this`) to a normal anonymous functions that have a mutable `this`.

This is not stable, this should definitley be an optional feature

Make sure this works when a synthdef funcGraph conatins nested, user-defined functions. I have a hunch this will break things, especially if you try to do some arithmetic using operators that are overloaded.

Note, we should check for stuff like `Math.pow` and replace with with a BinOp.

25052021
- [x] NamedControl's break sc.BinOp
- [ ] Need a way to parse BinOp operator into a special index. 
    - big look up table?

22052021
- UGen's that have a mul parameter don't actually pass this parameter to the server. The synthdef instead creates a BinOpUgen and multiplies the SinOsc with it. Thus your mul parameters will not work out of the box. Mul and add of Oscillators are just an alias for BinaryOpUGen. We finally have to deal with :((

## Resources (thanks)
- https://lihautan.com/babel-ast-explorer 
