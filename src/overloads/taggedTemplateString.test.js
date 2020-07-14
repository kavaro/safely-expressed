import { parseExpression, toJS, transform, overloadTaggedTemplateString } from '../index'

describe('overload tagged templateString', () => {
  it('should convert tagged templateString to function', () => {
    expect(toJS(transform(parseExpression('t`a{b}c{d}`'), [overloadTaggedTemplateString()]))).toEqual({
      code: `(function() {  return _.t(['a', 'c', ''], (function() {  return b;}).call(this), (function() {  return d;}).call(this));}).call(this)`,
      globals: ['b', 'd']
    })
  })
})
