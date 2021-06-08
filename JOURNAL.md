# synthdefjs
SuperCollider SynthDef in Native Javascript

07062021 Multi Output (ITS A MESS)
I finally finished a working version of a multi-output ugen. The first working version is hard coded to the `Control` UGen. The whole process of getting this to work ravaged the whole UGen generation codebase. The next work to be done is to rethink the foundations of UGen generation and perhaps the foundations of UGens in general. We need a better way to create "insertion" points where specific UGens can insert arbitrary "setup" code without runing the whole generation infrastructure used for the UGens that need less "bootstrap".
- [ ] rethink foundations of Ugen
	- one example, setting the `name` variable
	- creating a `init` function or a `construction` function insted of conflating that work with `addToGraph(.)`
- [ ] reconsider if functions used for generating UGens is worth it.
	- ie, is it possible to make it specific enough to be useful while also making it general enough to be able to deal with all the edge case UGens (like multiout and such). And if we do make it general, how do we make the interface safe and not too verbose?
	- Example of weird edge case. I pass some default values as input to a `Control.kr(.)` in order to determine the correct number of outputs; however, the input-spec of a `Control` has no inputs. We end up having to throw away those inputted default values,once we have determined the correct number of outputs.
- [ ] How do we deal with UGens that take arrays as inputs (not multichannel expansion)?
	- For `Out` and `Control` we always seem to flatten these arrays, is this the case for all UGens that have array inputs?

03062021 Multi Channel Expansion
- [ ] added a questionable interface for dealing with multi-channel expansion
	- ask for advice and clean it up
- [ ] not sure how well the multi-channel scales
- [x] we need multi-channel output UGens to start making things fully work
	- eg in named controls
- [x] figure out `OutputProxy` and how to do multi-out stuff
- [x] fix yr scopes
	- for UGen gen code

02062021 MORE BABEL
- [ ] make `+=` type of operations work
- [ ] custom synatx for pow using `**` ?
- [ ] Add 'AudioControl'

01062021
WORKING ON BABEL AND OP OVERLOADING
- [x] elegant errors
- [ ] stop duplication of inline fn definitions of nested fns.
- [x] implement a "keyword" at the top of all synthdef functions
	- this will be an alternative to forcing users to prepend functions with SC_
- [ ] do rigorous testing of the babel op overloading
- [ ] add operators for stuff like 'pow' 
- [ ] make the anonymous function syntax work with babel
- [x] grab root node of AST ONLY once when parsing
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
