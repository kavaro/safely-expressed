# Safely expressed

A compiler toolbox through which a sandboxed execution of javascript like expressions can be executed.
Implemented with moo and nearley. 

Compiler generates javascript code and instantiates new Function(scope, generated code).
Only whitelisted properties are allowed, no access to globals. 
The this keyword is a reference to the scope object passed to the function.
All globals are references to the corresponding property off the scope object.

# Warning

Use at own risk, there is no garanty this is a bullet proof solution.

# Usage

```javascript
import { createCompiler } from 'safely-expressed'

const compile = createCompiler()
const run = compile(`a + b`)
expect(run({ a: 'b', b: 's' })).toBe('bs')
```

# Supported Language constructs

- Nested template string: \`a{\`b{c}\`}d\` 
- Tagged template string (requires transform): tag\`a{b}c\`
- MemberExpression: a.b, a['b'] // only white listed and own properties are allowed (src/runtime/whitelist)
- CallExpression: a(...), a.b(...), a\['b'\](...)
- BinaryExpressions: |, &, ^, =, ==, ===, !=, !==, <>, >, >=, <, <=, +, -, *, /, %, >>, <<, >>>, ~, **
- LogicalExpressions: &&, ||
- UnaryExpressions: !, ~, +, -
- ConditionalEXpression: a > b ? a : b
- arrow functions: (...) => expression
- function declarations: (...) => expression;
- arrays: [], [a + b]
- objects: {a}, {a: 'a'}, {[a + b]: 'ab'}
- select: returns one of WHEN or DEFAULT expression
  SELECT(expression) {
    WHEN expression THEN expression
    DEFAULT expression
  }
- String: 'a', "a", \`a\`, tag\`a\`
- Number: 10, 1.2, -10, -1.2
- Regexp: /[a-z]/im.test('a')
- Literals: THIS, NULL, TRUE, FALSE
- Range (requires range overload): [10...20]

For more details see src/grammar.ne

# Examples

```javascript
import {
  createCompiler,
  overloadRangeExpression,
  overloadBinaryExpression,
  overloadMemberExpression,
  overloadMethodExpression,
  createRuntime,
  Range,
  whitelist
} from 'safely-expressed'
import assert from 'assert'

const compile = createCompiler()
const compiled = compile(`a + b`)
assert.equal(compiled({ a: 'b', b: 's' }), 'bs')

const compile2 = createCompiler(
  [
    overloadMemberExpression('$get'),
    overloadMethodExpression('$get'),
    overloadRangeExpression('$range'),
    overloadBinaryExpression({
      '=': '$equals',
      '>': '$gt',
      '>=': '$gte',
      '<': '$lt',
      '<=': '$lte',
      IN: '$in',
      BETWEEN: '$between'
    })
  ],
  createRuntime({ whitelist, Range })
)

const compiled2 = compile2(`
  prijs IN [10...15]
`)
assert.equal(compiled2({ prijs: 9 }), false, '9 IN [10...15]')
assert.equal(compiled2({ prijs: 10 }), true, '10 IN [10...15]')
assert.equal(compiled2({ prijs: 15 }), true, '15 IN [10...15]')
assert.equal(compiled2({ prijs: 16 }), false, '16 IN [10..15')

const compiled3 = compile2(`prijs BETWEEN [10...15]`)
assert.equal(compiled3({ prijs: 10 }), false, '10 BETWEEN [10...15]')
assert.equal(compiled3({ prijs: 11 }), true, '11 BETWEEN [10...15]')
assert.equal(compiled3({ prijs: 14 }), true, '14 BETWEEN [10...15]')
assert.equal(compiled3({ prijs: 15 }), false, '15 BETWEEN [10...15]')

const compiled4 = compile2('(prijs > 15 && prijs < 20) || prijs = 10')
assert.equal(compiled4({ prijs: 9 }), false, '(9 > 15 && 9 < 20) || 9 = 10')
assert.equal(compiled4({ prijs: 10 }), true, '(10 > 15 && 10 < 20) || 10 = 10')
assert.equal(compiled4({ prijs: 11 }), false, '(11 > 15 && 11 < 20) || 11 = 10')
assert.equal(compiled4({ prijs: 15 }), false, '(15 > 15 && 15 < 20) || 15 = 10')
assert.equal(compiled4({ prijs: 16 }), true, '(16 > 15 && 16 < 20) || 16 = 10')
assert.equal(compiled4({ prijs: 19 }), true, '(19 > 15 && 19 < 20) || 19 = 10')
assert.equal(compiled4({ prijs: 20 }), false, '(20 > 15 && 20 < 20) || 20 = 10')

const compiled5 = compile2(`
  console.log("Hello world")
`)
compiled5({ console: { log: function(...args) { console.log(...args) } } }) // outputs Hello world

const compiled6 = compile2(`
  ({}).constructor
`)
assert.equal(compiled6({ console: { log: function(...args) { console.log(...args) } } }), undefined, '({}).constructor')

const compiled7 = compile2(`
  min(a, b) => a < b ? a : b; // function expression
  min(v1, v2)
`)
assert.equal(compiled7({ v1: 5, v2: 10 }), 5, 'min(v1, v2)')
assert.equal(compiled7({ v1: 10, v2: 5 }), 5, 'min(v1, v2)')

const compiled8 = compile2(`
  { a: v1 + v2, b: v1 - v2 }
`)
assert.deepEqual(compiled8({ v1: 10, v2: 5 }), { a: 15, b: 5 }, '{ a: v1 + v2, b: v1 - v2 }')

const compiled9 = compile2(`
  [v1 + v2, v1 - v2]
`)
assert.deepEqual(compiled9({ v1: 10, v2: 5 }), [15, 5], '[v1 + v2, v1 - v2]')

const compiled10 = compile2(`
  v3 IN [v1 + v2...v1 - v2]
`)
assert.deepEqual(compiled10({ v1: 10, v2: 5, v3: 8 }), true, '[v1 + v2, v1 - v2]')

const compiled11 = compile2('`Welcome { to + ` The {wo + rld}` }`')
assert.equal(compiled11({ to: 'To', wo: 'Wo', rld: 'rld' }), 'Welcome To The World', '`Welcome { to + ` The {wo + rld}` }`')
```

# Included overloads

Overloads allow to transform the ast before code generation and are used for example to overload operators, implement tagged templates or add a range datatype.

## overloadBinaryExpression({'+': '$add', ...})

Transforms a + b into $add(a, b)

## overloadLogicalExpression({'&&': '$and', ...})

Transforms a && b into $and(a, b)

## overloadMemberExpression('$get', [computed])

- computed is false or undefined
  
  transform a.b into $get(a, 'b')
  transform a.b(arg) into $get(a, 'b', [arg])

- computed is true or undefined
  
  transform a['b'] into $get(a, 'b') 
  transform a['b'](arg) into $get(a, 'b', [arg])

## overloadRangeExpression('$range')

Transforms (a TO b) into $range(a, b)

## overloadTaggedTemplateString()

Transforms tag\`a{b}c{d}\` into tag(['a', 'c', ''], b, d)

## overloadUnaryExpression({'!': $not})

Transforms !a into $not(a)





