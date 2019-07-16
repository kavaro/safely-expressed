import { parseExpression, toJS, transform, overloadBinaryExpression } from '../index'

describe('overload BinaryExpression', () => {
  it('should overload BinaryExpression in ops object', () => {
    expect(toJS(transform(parseExpression(`prijs + prijs`), [overloadBinaryExpression({'+': '$add'})]))).toEqual({
      code: `(function() {  return self.$add(prijs, prijs);})()`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`prijs > prijs`), [overloadBinaryExpression({'>': '$gt'})]))).toEqual({
      code: `(function() {  return self.$gt(prijs, prijs);})()`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`prijs > prijs`), [overloadBinaryExpression({'+': '$add'})]))).toEqual({
      code: `(function() {  return prijs > prijs;})()`,
      globals: ['prijs']
    })
  })
})