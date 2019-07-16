import { parseExpression, toJS, transform, overloadUnaryExpression } from '../index'

describe('overload UnaryExpression', () => {
  it('should overload UnaryExpression in ops object', () => {
    expect(toJS(transform(parseExpression(`!prijs`), [overloadUnaryExpression({'!': '$not'})]))).toEqual({
      code: `(function() {  return self.$not(prijs, '!');})()`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`-prijs`), [overloadUnaryExpression({'!': '$not'})]))).toEqual({
      code: `(function() {  return -prijs;})()`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`-prijs`), [overloadUnaryExpression({'-': '$minus'})]))).toEqual({
      code: `(function() {  return self.$minus(prijs, '-');})()`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`+prijs`), [overloadUnaryExpression({'+': '$plus'})]))).toEqual({
      code: `(function() {  return self.$plus(prijs, '+');})()`,
      globals: ['prijs']
    })
  })
})