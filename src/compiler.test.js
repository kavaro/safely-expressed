import { isNumber } from 'lodash/lang'
import {
  createCompiler,
  overloadBinaryExpression,
  overloadLogicalExpression,
  overloadMemberExpression,
  overloadRangeExpression,
  overloadTaggedTemplateString,
  overloadUnaryExpression
} from './index'

describe('compiler', () => {
  it('should evaluate empty expression', () => {
    const compile = createCompiler()
    const fn = compile(``)
    expect(fn()).toBe(undefined)
  })
  it('should evaluate null', () => {
    const compile = createCompiler()
    const fn = compile(`NULL`)
    expect(fn()).toBe(null)
  })
  it('should evaluate false', () => {
    const compile = createCompiler()
    const fn = compile(`FALSE`)
    expect(fn()).toBe(false)
  })
  it('should evaluate true', () => {
    const compile = createCompiler()
    const fn = compile(`TRUE`)
    expect(fn()).toBe(true)
  })
  it('should evaluate number', () => {
    const compile = createCompiler()
    const fn = compile(`10`)
    expect(fn()).toBe(10)
  })
  it('should evaluate single quoted string', () => {
    const compile = createCompiler()
    const fn = compile(`'a'`)
    expect(fn()).toBe('a')
  })
  it('should evaluate double quoted string', () => {
    const compile = createCompiler()
    const fn = compile(`"a"`)
    expect(fn()).toBe("a")
  })
  it('should evaluate template string', () => {
    const compile = createCompiler()
    const fn = compile('`a`')
    expect(fn()).toBe('a')
  })
  it('should evaluate array', () => {
    const compile = createCompiler()
    const fn = compile('[1, 2]')
    expect(fn()).toEqual([1, 2])
  })
  it('should evaluate object', () => {
    const compile = createCompiler()
    const fn = compile(`{'a': 1, "b": 2, c: 3, 10: 4, true: 5, FALSE: 6, null: 7}`)
    expect(fn()).toEqual({ a: 1, b: 2, c: 3, 10: 4, true: 5, FALSE: 6, null: 7 })
  })
  it('should evaluate identifier', () => {
    const compile = createCompiler()
    const fn = compile(`a`)
    expect(fn({ a: 10 })).toBe(10)
  })
  it('should evaluate regexp', () => {
    const compile = createCompiler()
    const fn = compile(`/^abc$/i.test(a)`)
    expect(fn({ a: 'abc' })).toBe(true)
    expect(fn({ a: 'Abc' })).toBe(true)
    expect(fn({ a: 'bac' })).toBe(false)
  })
  it('should evaulate nested template strings', () => {
    const compile = createCompiler()
    const fn = compile('`My name is {firstName + ` {middleName + ` ` + lastName}`}`')
    expect(fn({ firstName: 'Karl', middleName: 'Julien', lastName: 'Van Rompaey' })).toBe('My name is Karl Julien Van Rompaey')
  })
  it('should evaluate expression with global', () => {
    const compile = createCompiler()
    const fn = compile(`prijs > 0 && prijs < 5`)
    expect(fn({ prijs: 5 })).toBe(false)
    expect(fn({ prijs: 0 })).toBe(false)
    expect(fn({ prijs: 1 })).toBe(true)
    expect(fn({ prijs: 4 })).toBe(true)
  })
  it('should evaluate expression with multiple globals', () => {
    const compile = createCompiler()
    const fn = compile(`a > 0 && b < 5`)
    expect(fn({ a: 0, b: 4 })).toBe(false)
    expect(fn({ a: 1, b: 4 })).toBe(true)
  })
  it('should access object members', () => {
    const compile = createCompiler()
    const fn = compile(`prijs['min'] > 0 && prijs.max < 5`)
    expect(fn({ prijs: { min: 0, max: 5 } })).toBe(false)
    expect(fn({ prijs: { min: 1, max: 5 } })).toBe(false)
    expect(fn({ prijs: { min: 0, max: 4 } })).toBe(false)
    expect(fn({ prijs: { min: 1, max: 4 } })).toBe(true)
  })
  it('should access class members', () => {
    const compile = createCompiler()
    const fn = compile(`prijs.min > 0 && prijs.max < 5`)
    class Prijs {
      constructor(min, max) {
        this.min = min
        this.max = max
      }
    }
    expect(fn({ prijs: new Prijs(0, 5) })).toBe(false)
    expect(fn({ prijs: new Prijs(1, 5) })).toBe(false)
    expect(fn({ prijs: new Prijs(0, 4) })).toBe(false)
    expect(fn({ prijs: new Prijs(1, 4) })).toBe(true)
  })
  it('should call function declaration', () => {
    const compile = createCompiler()
    const fn = compile(`
      max(a, b) => a > b ? a : b;
      max(prijs.min, prijs.max) > 2
    `)
    expect(fn({ prijs: { min: 0, max: 2 } })).toBe(false)
    expect(fn({ prijs: { min: 2, max: 0 } })).toBe(false)
    expect(fn({ prijs: { min: 3, max: 0 } })).toBe(true)
    expect(fn({ prijs: { min: 0, max: 3 } })).toBe(true)
  })
  it('should call function on this', () => {
    const compile = createCompiler()
    const fn = compile(`this.max(prijs.min, prijs.max) > 2`)
    const max = (a, b) => a > b ? a : b
    expect(fn({ prijs: { min: 0, max: 2 }, max })).toBe(false)
    expect(fn({ prijs: { min: 2, max: 0 }, max })).toBe(false)
    expect(fn({ prijs: { min: 3, max: 0 }, max })).toBe(true)
    expect(fn({ prijs: { min: 0, max: 3 }, max })).toBe(true)
  })
  it('should call computed function on this', () => {
    const compile = createCompiler()
    const fn = compile(`this['max'](prijs.min, prijs.max) > 2`)
    const max = (a, b) => a > b ? a : b
    expect(fn({ prijs: { min: 0, max: 2 }, max })).toBe(false)
    expect(fn({ prijs: { min: 2, max: 0 }, max })).toBe(false)
    expect(fn({ prijs: { min: 3, max: 0 }, max })).toBe(true)
    expect(fn({ prijs: { min: 0, max: 3 }, max })).toBe(true)
  })
  it('should call method on runtime object', () => {
    const compile = createCompiler()
    const fn = compile(`max() > 2`)
    class Price {
      constructor(_min, _max) {
        this._min = _min
        this._max = _max
      }

      max() {
        const { _min, _max } = this
        return _min > _max ? _min : _max
      }
    }
    expect(fn(new Price(0, 2))).toBe(false)
    expect(fn(new Price(2, 0))).toBe(false)
    expect(fn(new Price(3, 0))).toBe(true)
    expect(fn(new Price(0, 3))).toBe(true)
  })
  it('should call arrow function', () => {
    const compile = createCompiler()
    const fn = compile(`properties.filter((property) => property.id === 'a')`)
    expect(fn({ properties: [{ id: 'a' }, { id: 'b' }] })).toEqual([{ id: 'a' }])
  })
  it('should compile select', () => {
    const compile = createCompiler()
    const fn = compile(`
      KIES(op) {
        ALS 'increment' DAN value + 1
        ALS 'decrement' DAN value - 1
        ANDERS c
      }
    `)
    expect(fn({ op: 'increment', value: 0 })).toBe(1)
    expect(fn({ op: 'decrement', value: 1 })).toBe(0)
  })
  it('should overload binary expression', () => {
    const compile = createCompiler([overloadBinaryExpression({ '+': '$add' })], { $add: (left, right) => `${left}-${right}` })
    const fn = compile(`a + b`)
    expect(fn({
      a: 'A',
      b: 'B'
    })).toBe('A-B')
  })
  it('should overload logical expression', () => {
    const compile = createCompiler([overloadLogicalExpression({ '&&': '$and' })], { $and: (left, right) => `${left}-${right}` })
    const fn = compile(`a && b`)
    expect(fn({
      a: 'A',
      b: 'B'
    })).toBe('A-B')
  })
  it('should overload member expression', () => {
    const compile = createCompiler([overloadMemberExpression('$get')], { $get: (object, property) => object[property] })
    const fn = compile(`a.b + a['b']`)
    expect(fn({
      a: { b: 'AB' }
    })).toBe('ABAB')
  })
  it('should overload range expression', () => {
    const compile = createCompiler([overloadRangeExpression('$range')], { $range: (left, right) => `${left}-${right}` })
    const fn = compile(`[ a...b ]`)
    expect(fn({
      a: 'A',
      b: 'B'
    })).toBe('A-B')
  })
  it('should overload tagged template string', () => {
    const compile = createCompiler([overloadTaggedTemplateString()])
    const fn = compile('t`a{b}c{d}`')
    expect(fn({
      t: (strings, ...values) => {
        let str = []
        values.push('')
        strings.forEach((string, i) => str.push(string, values[i]))
        return str.join('')
      },
      b: 'B',
      d: 'D'
    })).toBe('aBcD')
  })
  it('should overload unary expression', () => {
    const compile = createCompiler([overloadUnaryExpression({ '!': '$not' })], { $not: (right, op) => `${op}-${right}` })
    const fn = compile(`!a`)
    expect(fn({
      a: 'A',
    })).toBe('!-A')
  })
  it('should compile object expression', () => {
    const compile = createCompiler(
      [
        overloadMemberExpression('$get')
      ],
      {
        $get: (object, property) => object[property]
      }
    )
    const fn = compile(`
    {
      firstname: name.first,
      lastname: name.last,
      name: \`{name.first} {name.last}\`,
      age: year - yearOfBirth
    }
    `)
    expect(fn({
      name: { first: 'Karl', last: 'Van Rompaey' },
      yearOfBirth: 1966,
      year: 2019
    })).toEqual({
      firstname: 'Karl',
      lastname: 'Van Rompaey',
      name: 'Karl Van Rompaey',
      age: 53
    })
  })
  it('should validate', () => {
    const compile = createCompiler([
      overloadMemberExpression('$get')
    ],
    {
      $get: (object, property) => object.hasOwnProperty(property) ? object[property] : undefined
    })
    const fn = compile(`
      isPositive(value) => value >= 0;
      isInteger(value) => Math.floor(value) === value;
      positiveInteger(value) => isNumber(value) && isPositive(value) && isInteger(value);
      positiveInteger(value)
    `)
    expect(fn({ value: 0, isNumber, Math })).toBe(true)
  })
})