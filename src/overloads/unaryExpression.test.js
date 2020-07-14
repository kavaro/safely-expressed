import { parseExpression, toJS, transform, overloadUnaryExpression } from '../index'

describe('overload UnaryExpression', () => {
  it('should overload UnaryExpression in ops object', () => {
    expect(toJS(transform(parseExpression(`!prijs`), [overloadUnaryExpression({'!': '$not'})]))).toEqual({
      code: `(function() {  return this.$not(prijs, '!');}).call(this)`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`-prijs`), [overloadUnaryExpression({'!': '$not'})]))).toEqual({
      code: `(function() {  return -prijs;}).call(this)`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`-prijs`), [overloadUnaryExpression({'-': '$minus'})]))).toEqual({
      code: `(function() {  return this.$minus(prijs, '-');}).call(this)`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`+prijs`), [overloadUnaryExpression({'+': '$plus'})]))).toEqual({
      code: `(function() {  return this.$plus(prijs, '+');}).call(this)`,
      globals: ['prijs']
    })
  })
})