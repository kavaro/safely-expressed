import { parseExpression, toJS } from './index'

describe('toJS', () => {
  it('should compile with line comment', () => {
    expect(toJS(parseExpression(`
      10 // This is a test
      // and another line
      + 20
    `))).toEqual({
      code: '(function() {  return 10 + 20;}).call(this)',
      globals: []
    })
  })
  it('should compile with line comment without \n', () => {
    expect(toJS(parseExpression(`
      10 + 20 // This is a test`))).toEqual({
      code: '(function() {  return 10 + 20;}).call(this)',
      globals: []
    })

  })
  it('should compile with multi line comment', () => {
    expect(toJS(parseExpression(`
      10 /* This is a test
      and another line */ + 20
    `))).toEqual({
      code: '(function() {  return 10 + 20;}).call(this)',
      globals: []
    })
  })
  it('should compile empty string', () => {
    expect(toJS(parseExpression(``))).toEqual({
      code: '(function() {  return undefined;}).call(this)',
      globals: []
    })
  })
  it('should generate javascript', () => {
    expect(toJS(parseExpression(`
      prijs.min > 100000 EN prijs["max"] < 150000
    `))).toEqual({
      code: `(function() {  return prijs.min > 100000 && prijs["max"] < 150000;}).call(this)`,
      globals: ['prijs']
    })
    expect(toJS(parseExpression(`
      Min(a, b) => a < b ? a : b; Max(a, b) => a > b ? a : b; Min(prijs.min, prijs.max) > 100000 EN Max(prijs.min, prijs.max) < 150000
    `))).toEqual({
      code: `(function() {const Min = (function (a, b) { return a < b ? a : b; }).bind(this);const Max = (function (a, b) { return a > b ? a : b; }).bind(this);  return Min(prijs.min, prijs.max) > 100000 && Max(prijs.min, prijs.max) < 150000;}).call(this)`,
      globals: ['prijs']
    })
    expect(toJS(parseExpression(`
      {
        prijs: prijs, 
        beds: beds
      }
    `))).toEqual({
      code: `(function() {  return {'prijs': prijs, 'beds': beds};}).call(this)`,
      globals: ['prijs', 'beds']
    })
    expect(toJS(parseExpression(`
      {
        prijs, 
        beds
      }
    `))).toEqual({
      code: `(function() {  return {'prijs': prijs, 'beds': beds};}).call(this)`,
      globals: ['prijs', 'beds']
    })
    expect(toJS(parseExpression(`
      {
        [prijs + 1], 
        [beds]
      }
    `))).toEqual({
      code: `(function() {  return {[prijs + 1]: prijs + 1, [beds]: beds};}).call(this)`,
      globals: ['prijs', 'beds']
    })
    expect(toJS(parseExpression(`
      {
        [prijs + 1]: true, 
        [beds]
      }
    `))).toEqual({
      code: `(function() {  return {[prijs + 1]: true, [beds]: beds};}).call(this)`,
      globals: ['prijs', 'beds']
    })
    expect(toJS(parseExpression(`
      db.properties.filter((property) => property.prijs > 100 EN property.slaapkamers = 2)
    `))).toEqual({
      code: `(function() {  return db.properties.filter(function (property) { return property.prijs > 100 && property.slaapkamers = 2; });}).call(this)`,
      globals: ['db']
    })
  })
  it('should compile parenthesis', () => {
    expect(toJS(parseExpression(`a + (b - c)`))).toEqual({
      code: '(function() {  return a + (b - c);}).call(this)',
      globals: ['a', 'b', 'c']
    })
  })
  it('should compile array', () => {
    expect(toJS(parseExpression('[0, 1]'))).toEqual({ code: '(function() {  return [0, 1];}).call(this)', globals: [] })
  })
  it('should compile empty array', () => {
    expect(toJS(parseExpression('[]'))).toEqual({ code: '(function() {  return [];}).call(this)', globals: [] })
  })
  it('should compile select with when and default', () => {
    expect(toJS(parseExpression(`
      SELECT(n) {
        WHEN 0 THEN 'a'
        WHEN 1 THEN 'b'
        DEFAULT 'c'
      }
    `))).toEqual({
      code: "(function() {  return ((function() { var $c = n; return ($c === 0) ? 'a' : ($c === 1) ? 'b' : 'c' }).call(this));}).call(this)",
      globals: ['n']
    })
  })
  it('should compile select without default', () => {
    expect(toJS(parseExpression(`
      SELECT(n) {
        WHEN 0 THEN 'a'
        WHEN 1 THEN 'b'
      }
    `))).toEqual({
      code: "(function() {  return ((function() { var $c = n; return ($c === 0) ? 'a' : ($c === 1) ? 'b' : undefined }).call(this));}).call(this)",
      globals: ['n']
    })
  })
  it('should compile select without when', () => {
    expect(toJS(parseExpression(`
      SELECT(n) {
        DEFAULT 'd'
      }
    `))).toEqual({
      code: "(function() {  return ((function() { var $c = n; return 'd' }).call(this));}).call(this)",
      globals: ['n']
    })
  })
  it('should compile select without when and without default', () => {
    expect(toJS(parseExpression(`
      SELECT(n) {
      }
    `))).toEqual({
      code: "(function() {  return ((function() { var $c = n; return undefined }).call(this));}).call(this)",
      globals: ['n']
    })
  })
  it('should throw on range expression', () => {
    expect(() => toJS(parseExpression(`[10...100]`)))
      .toThrow(new Error(`RangeExpression requires overloadRangeExpression transform`))
  })
  it('should throw on tagged template string', () => {
    expect(() => toJS(parseExpression('tag`string`')))
      .toThrow(new Error(`TaggedTemplateString requires overloadTaggedTemplateString transform`))
  })
  it('should compile template string', () => {
    expect(toJS(parseExpression('`My name is`'))).toEqual({
      code: `(function() {  return 'My name is';}).call(this)`,
      globals: []
    })
  })
  it('should compile template string with interpolation', () => {
    expect(toJS(parseExpression('`Welcome {name} to`'))).toEqual({
      code: `(function() {  return 'Welcome ' + ((function() {  return name;}).call(this)) + ' to';}).call(this)`,
      globals: ['name']
    })
  })
  it('should compile template string with interpolation that contains declaration', () => {
    expect(toJS(parseExpression('`Welcome {Min(a, b) => a < b ? a : b; Min(low, high)} to`'))).toEqual({
      code: `(function() {  return 'Welcome ' + ((function() {const Min = (function (a, b) { return a < b ? a : b; }).bind(this);  return Min(low, high);}).call(this)) + ' to';}).call(this)`,
      globals: ['low', 'high']
    })
  })
})