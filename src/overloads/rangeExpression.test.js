import { parseExpression, toJS, transform, overloadRangeExpression } from '../index'

describe('overload RangeExpression', () => {
  it('should overload RangeExpression', () => {
    expect(toJS(transform(parseExpression(`(100 TOT prijs) > 100`), [overloadRangeExpression('$range')]))).toEqual({
      code: `(function() {  return self.$range(100, prijs) > 100;})()`,
      globals: ['prijs']
    })
  })
})