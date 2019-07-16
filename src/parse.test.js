import { parseExpression, parseTemplateString, toString } from './index'

describe('parseExpression', () => {
  it('parses empty expression', () => {
    expect(parseExpression('').expression).toBe(null)
  })
  it('parses ""', () => {
    expect(toString(parseExpression('""'))).toBe('""')
    expect(toString(parseExpression('"\\""'))).toBe('"\\""')
  })
  it("parses ''", () => {
    expect(toString(parseExpression("''"))).toBe("''")
    expect(toString(parseExpression("'\\''"))).toBe("'\\''")
  })
  it('parses ``', () => {
    expect(toString(parseExpression('``'))).toBe('``')
    expect(toString(parseExpression('`\\``'))).toBe('`\\``')
    expect(toString(parseExpression('myTag``'))).toBe('myTag``')
    expect(toString(parseExpression('myTag ``'))).toBe('myTag``')
  })
  it('parses number', () => {
    expect(toString(parseExpression('123.456'))).toBe('123.456')
    expect(parseExpression('123.456').expression.integer).toBe(false)
    expect(toString(parseExpression('123'))).toBe('123')
    expect(parseExpression('123').expression.integer).toBe(true)
  })
  it('parses identifier', () => {
    expect(toString(parseExpression('a'))).toBe('a')
  })
  it('parses regexp', () => {
    expect(toString(parseExpression('/[^a]/'))).toBe('/[^a]/')    
    expect(toString(parseExpression('/[^a]/im'))).toBe('/[^a]/im')    
    expect(toString(parseExpression('/[^a].test(b)/'))).toBe('/[^a].test(b)/')    
  })
  it('should parse string with unicode', () => {
    expect(toString(parseExpression('"\\u00A9"'))).toBe('"\\u00A9"')
  })
  it('should parse arrow function', () => {
    expect(toString(parseExpression('db.filter(() => a + b)'))).toBe('db.filter(() => a + b)')
    expect(toString(parseExpression('db.filter((a) => a + b)'))).toBe('db.filter((a) => a + b)')
    expect(toString(parseExpression('db.filter((a, b) => a + b)'))).toBe('db.filter((a, b) => a + b)')
    expect(toString(parseExpression('db["filter"]((a, b) => a + b)'))).toBe('db["filter"]((a, b) => a + b)')
  })
  it('parses identifier + string', () => {
    expect(toString(parseExpression('a + ""'))).toBe('a + ""')
    expect(toString(parseExpression('a + "b"'))).toBe('a + "b"')
    expect(toString(parseExpression("a + 'b'"))).toBe("a + 'b'")
    expect(toString(parseExpression('a + `b`'))).toBe('a + `b`')
  })
  it('parses identifier + string + identifier', () => {
    expect(toString(parseExpression('a + "" + c'))).toBe('a + "" + c')
    expect(toString(parseExpression('a + "b" + c'))).toBe('a + "b" + c')
    expect(toString(parseExpression("a + 'b' + c"))).toBe("a + 'b' + c")
    expect(toString(parseExpression('a + `b` + c'))).toBe('a + `b` + c')
  })
  it('parses identifier + number', () => {
    expect(toString(parseExpression('a + 10'))).toBe('a + 10')
  })
  it('parses nested expressions with template strings and strings with escaped `', () => {
    expect(toString(parseExpression('a + `{"`" + \'`\' + `{b + `c{d}e`}`}`'))).toBe('a + `{"`" + \'`\' + `{b + `c{d}e`}`}`')
  })
  it('parses interpolation in value of object', () => {
    expect(toString(parseExpression('{a: `b {c} d`}'))).toBe('{\'a\': `b {c} d`}')
  })
  it('parses interpolation in key of object', () => {
    expect(toString(parseExpression('{[`b {c} d`]: a}'))).toBe('{[`b {c} d`]: a}')
  })
  it('parse conditional expression', () => {
    expect(toString(parseExpression('a ? b : c'))).toBe('a ? b : c')
    expect(toString(parseExpression('a ? b ? c : d : e ? f : g'))).toBe('a ? b ? c : d : e ? f : g')
  })
  it('parses member expression', () => {
    expect(toString(parseExpression('a.b["c"]["d"].e["f"]'))).toBe('a.b["c"]["d"].e["f"]')
  })
  it('parses call expressions', () => {
    expect(toString(parseExpression('a()'))).toBe('a()')
    expect(toString(parseExpression('a(b)'))).toBe('a(b)')
    expect(toString(parseExpression('a(b, c)'))).toBe('a(b, c)')
    expect(toString(parseExpression('a(b, c, d)'))).toBe('a(b, c, d)')
    expect(toString(parseExpression('a(b + c, c + d, d + e)'))).toBe('a(b + c, c + d, d + e)')
  })
  it('parses declarations', () => {
    expect(toString(parseExpression('a() => true;'))).toBe('a() => TRUE;')
    expect(toString(parseExpression('a(b) => false;'))).toBe('a(b) => FALSE;')
    expect(toString(parseExpression('a(b,c) => false;'))).toBe('a(b, c) => FALSE;')
    expect(toString(parseExpression('a() => false; b() => true;'))).toBe('a() => FALSE;b() => TRUE;')
    expect(toString(parseExpression('a() => false; a OF b'))).toBe('a() => FALSE;a || b')
  })
  it('parses logical expressions', () => {
    expect(toString(parseExpression('a OF b'))).toBe('a || b')
    expect(toString(parseExpression('a AND b'))).toBe('a && b')
  })
  it('parses binary expressions', () => {
    expect(toString(parseExpression('a & b'))).toBe('a & b')
    expect(toString(parseExpression('a | b'))).toBe('a | b')
    expect(toString(parseExpression('a ^ b'))).toBe('a ^ b')
    expect(toString(parseExpression('a === b'))).toBe('a === b')
    expect(toString(parseExpression('a !== b'))).toBe('a !== b')
    expect(toString(parseExpression('a == b'))).toBe('a == b')
    expect(toString(parseExpression('a != b'))).toBe('a != b')
    expect(toString(parseExpression('a = b'))).toBe('a = b')
    expect(toString(parseExpression('a <> b'))).toBe('a <> b')
    expect(toString(parseExpression('a < b'))).toBe('a < b')
    expect(toString(parseExpression('a <= b'))).toBe('a <= b')
    expect(toString(parseExpression('a > b'))).toBe('a > b')
    expect(toString(parseExpression('a >= b'))).toBe('a >= b')
    expect(toString(parseExpression('a in b'))).toBe('a IN b')
    expect(toString(parseExpression('a instanceof b'))).toBe('a INSTANCE_OF b')
    expect(toString(parseExpression('a << b'))).toBe('a << b')
    expect(toString(parseExpression('a >> b'))).toBe('a >> b')
    expect(toString(parseExpression('a >>> b'))).toBe('a >>> b')
    expect(toString(parseExpression('a + b'))).toBe('a + b')
    expect(toString(parseExpression('a - b'))).toBe('a - b')
    expect(toString(parseExpression('a * b'))).toBe('a * b')
    expect(toString(parseExpression('a / b'))).toBe('a / b')
    expect(toString(parseExpression('a % b'))).toBe('a % b')
    expect(toString(parseExpression('a ** b'))).toBe('a ** b')
    expect(toString(parseExpression('!b'))).toBe('!b')
    expect(toString(parseExpression('NIET b'))).toBe('!b')
    expect(toString(parseExpression('~b'))).toBe('~b')
    expect(toString(parseExpression('+b'))).toBe('+b')
    expect(toString(parseExpression('-b'))).toBe('-b')
  })
  it('should parse expression with parenthesis', () => {
    expect(toString(parseExpression('(a + b)'))).toBe('(a + b)')
  })
  it('should ignore parenthesis around identifiers and literals', () => {
    expect(toString(parseExpression('(a)'))).toBe('a')
    expect(toString(parseExpression('(this)'))).toBe('THIS')
  })
  it('should parse literals', () => {
    expect(toString(parseExpression('true'))).toBe('TRUE')
    expect(toString(parseExpression('false'))).toBe('FALSE')
    expect(toString(parseExpression('null'))).toBe('NULL')
    expect(toString(parseExpression('this'))).toBe('THIS')
  })
  it('parses range', () => {
    expect(toString(parseExpression('(10 TO 15)'))).toBe('(10 TO 15)')
    expect(toString(parseExpression('(a - b TO a + b)'))).toBe('(a - b TO a + b)')
  })
  it('parses array', () => {
    expect(toString(parseExpression('[]'))).toBe('[]')
    expect(toString(parseExpression('[10]'))).toBe('[10]')
    expect(toString(parseExpression('[10, 20]'))).toBe('[10, 20]')
    expect(toString(parseExpression('[a - b, a + b]'))).toBe('[a - b, a + b]')
    expect(toString(parseExpression('[10, 20, []]'))).toBe('[10, 20, []]')
    expect(toString(parseExpression('[{}]'))).toBe('[{}]')
  })
  it('parses object', () => {
    expect(toString(parseExpression('{}'))).toBe('{}')
    expect(toString(parseExpression('{a:b}'))).toBe(`{'a': b}`)
    expect(toString(parseExpression('{[a + b]:a - b}'))).toBe('{[a + b]: a - b}')
    expect(toString(parseExpression('{a:{b:"b"}}'))).toBe(`{'a': {'b': "b"}}`)
    expect(toString(parseExpression('{a:b, c: []}'))).toBe(`{'a': b, 'c': []}`)
    expect(toString(parseExpression('{[a]:b, c: []}'))).toBe(`{[a]: b, 'c': []}`)
  })
  it('ignores // comments', () => {
    expect(toString(parseExpression(`
      //
      a + b
    `))).toBe('a + b')
    expect(toString(parseExpression(`
      // This is a single line comment
      a + b
    `))).toBe('a + b')
  })
  it('ignores /* */ comment', () => {
    expect(toString(parseExpression(`a /**/+ b`))).toBe('a + b')
    expect(toString(parseExpression(`
      a
      /*
        This is a multi line comment
      */
      + b
    `))).toBe('a + b')
  })
  it('parses SELECT', () => {
    expect(toString(parseExpression(`
      KIES(a + b) {
        ALS 'increment' + a DAN c + 1
        ALS 'decrement' + b DAN c - 1
        ANDERS c
      }
    `))).toBe(`SELECT(a + b) { WHEN 'increment' + a THEN c + 1 WHEN 'decrement' + b THEN c - 1 DEFAULT c }`)
  })
})

describe('parseTemplateString', () => {
  it('parses empty string', () => {
    expect(toString(parseTemplateString(''))).toBe('``')
  })
  it('parses interpolation', () => {
    expect(toString(parseTemplateString('{a}'))).toBe('`{a}`')
  })
  it('parses interpolation expression', () => {
    expect(toString(parseTemplateString('a {b + c} d'))).toBe('`a {b + c} d`')
  })
  it('parses multiple interpolation expressions', () => {
    expect(toString(parseTemplateString('a {b + c} d {e} f'))).toBe('`a {b + c} d {e} f`')
  })
  it('allows escaped `', () => {
    expect(toString(parseTemplateString('\\`'))).toBe('`\\``')
  })
})