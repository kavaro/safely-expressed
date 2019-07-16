import { parseExpression, toJS, transform, overloadLogicalExpression } from '../index'

describe('overload LogicalExpression', () => {
  it('should overload LogicalExpression in ops object', () => {
    expect(toJS(transform(parseExpression(`prijs && prijs`), [overloadLogicalExpression({'&&': '$and'})]))).toEqual({
      code: `(function() {  return self.$and(prijs, prijs);})()`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`prijs || prijs`), [overloadLogicalExpression({'&&': '$and'})]))).toEqual({
      code: `(function() {  return prijs || prijs;})()`,
      globals: ['prijs']
    })
  })
})