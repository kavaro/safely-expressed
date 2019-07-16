import { parseExpression, toJS, transform, overloadTaggedTemplateString } from '../index'

describe('overload tagged templateString', () => {
  it('should convert tagged templateString to function', () => {
    expect(toJS(transform(parseExpression('t`a{b}c{d}`'), [overloadTaggedTemplateString()]))).toEqual({
      code: `(function() {  return self.t(['a', 'c', ''], (function() {  return b;})(), (function() {  return d;})());})()`,
      globals: ['b', 'd']
    })
  })
})
