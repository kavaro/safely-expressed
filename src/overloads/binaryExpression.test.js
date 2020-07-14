import { parseExpression, toJS, transform, overloadBinaryExpression } from '../index'

describe('overload BinaryExpression', () => {
  it.only('should overload BinaryExpression in ops object', () => {
    expect(toJS(transform(parseExpression(`prijs + prijs`), [overloadBinaryExpression({'+': '$add'})]))).toEqual({
      code: `(function() {  return this.$add(prijs, prijs);}).call(this)`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`prijs > prijs`), [overloadBinaryExpression({'>': '$gt'})]))).toEqual({
      code: `(function() {  return this.$gt(prijs, prijs);}).call(this)`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`prijs > prijs`), [overloadBinaryExpression({'+': '$add'})]))).toEqual({
      code: `(function() {  return prijs > prijs;}).call(this)`,
      globals: ['prijs']
    })
  })
})