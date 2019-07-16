import { parseExpression, toJS, transform, overloadMemberExpression } from '../index'

describe('overload MemberExpression', () => {
  it('should overload ANY MemberExpression', () => {
    expect(toJS(transform(parseExpression(`prijs.min > 100`), [overloadMemberExpression('$get')]))).toEqual({
      code: `(function() {  return self.$get(prijs, 'min') > 100;})()`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`prijs['min'] > 100`), [overloadMemberExpression('$get')]))).toEqual({
      code: `(function() {  return self.$get(prijs, 'min') > 100;})()`,
      globals: ['prijs']
    })
  })
  it('should overload computed MemberExpression', () => {
    expect(toJS(transform(parseExpression(`prijs['min'] > 100`), [overloadMemberExpression('$get', true)]))).toEqual({
      code: `(function() {  return self.$get(prijs, 'min') > 100;})()`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`prijs.min > 100`), [overloadMemberExpression('$get', true)]))).toEqual({
      code: `(function() {  return prijs.min > 100;})()`,
      globals: ['prijs']
    })
  })
  it('should overload NOT computed MemberExpression', () => {
    expect(toJS(transform(parseExpression(`prijs['min'] > 100`), [overloadMemberExpression('$get', false)]))).toEqual({
      code: `(function() {  return prijs['min'] > 100;})()`,
      globals: ['prijs']
    })
    expect(toJS(transform(parseExpression(`prijs.min > 100`), [overloadMemberExpression('$get', false)]))).toEqual({
      code: `(function() {  return self.$get(prijs, 'min') > 100;})()`,
      globals: ['prijs']
    })
  })
})