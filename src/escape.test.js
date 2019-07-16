import escape from './escape'

describe('escape', () => {
  it('should escape string', () => {
    expect(escape(`Karl's book\\'s`, "'")).toBe(`Karl\\'s book\\'s`)
  })
})