import { isString } from 'lodash/lang'

function createNode(node) {
  const { type, value, text, line, col, offset } = node
  return {
    type,
    value,
    text,
    line,
    col,
    offset
  }
}

export function createNumber(node) {
  node = createNode(node)
  node.type = 'Number'
  node.value = parseFloat(node.value)
  node.integer = Math.floor(node.value) === node.value
  return node
}

export const stringEscapes = {
  '`': '`',
  '"': '"',
  "'": "'",
  'b': '\b',
  'f': '\f',
  'n': '\n',
  'r': '\r',
  't': '\t',
  '/': '\/',
  '\\': '\\'
}

export function createString(node, type, tag) {
  node = createNode(node)
  node.type = type
  node.value = node.value
    .slice(1, -1)
    .replace(/\\[`'"bfnrt\/\\]/g, token => stringEscapes[token.slice(1)])
    .replace(/\\u[a-fA-F0-9]{4}/, token => (new Function('', `return '\\u${token.slice(2)}'`))())
  if (type === 'TemplateString' && tag) {
    tag.type = 'TemplateTag'
    node.tag = tag
  }
  return node
}

export function createRegExp(node) {
  node = createNode(node)
  node.type = 'RegExp'
  const endOfPattern = node.value.lastIndexOf('/')
  const pattern = node.value.slice(1, endOfPattern)
  const modifiers = node.value.slice(endOfPattern + 1)
  const flags = {}
  modifiers.split('').forEach(c => flags[c] = true)
  node.pattern = pattern
  node.flags = Object.keys(flags).sort().join('')
  node.value = new RegExp(pattern, node.flags)
  return node
}

export function createLiteral(node, value) {
  node = createNode(node)
  node.type = 'Literal'
  node.value = value
  return node
}

export function createIdentifier(node) {
  node = createNode(node)
  node.type = 'Identifier'
  return node
}

export function createCommaExpression(d) {
  const expressions = []
  if (d) {
    expressions.push(d[0])
    const repeatedExpression = d[1]
    for (let i in repeatedExpression) {
      expressions.push(repeatedExpression[i][3])
    }
  }
  return {
    type: 'CommaExpression',
    expressions
  }
}

export function createMemberExpression(object, computed, property) {
  const node = {
    type: 'MemberExpression',
    computed,
    object,
    property
  }
  return node
}

export function createCallExpression(object, args) {
  if (object.type === 'MemberExpression') {
    return {
      ...object,
      type: 'MethodExpression',
      args
    }
  }
  return {
    type: 'CallExpression',
    object,
    args
  }
}

export function createUnaryExpression(op, right) {
  if (!isString(op)) {
    op = op.value
  }
  return {
    type: 'UnaryExpression',
    op,
    right
  }
}

export function createConditionalExpression(test, consequence, alternate) {
  return {
    type: 'ConditionalExpression',
    test,
    consequence,
    alternate
  }
}

export function createLogicalExpression(left, op, right) {
  return {
    type: 'LogicalExpression',
    left,
    op,
    right
  }
}

export function createBinaryExpression(left, op, right) {
  return {
    type: 'BinaryExpression',
    left,
    op,
    right
  }
}

export function createDeclaration(name, arrowFunction) {
  return {
    type: 'Declaration',
    name,
    args: arrowFunction.args,
    expression: arrowFunction.expression
  }
}

export function createArrowFunction(args, expression) {
  return {
    type: 'ArrowFunction',
    args,
    expression
  }
}

export function createRangeExpression(left, right) {
  return {
    type: 'RangeExpression',
    left,
    right
  }
}

export function createArrayExpression(items) {
  return {
    type: 'ArrayExpression',
    items
  }
}

function extractPair(kv, output) {
  output.push({
    type: 'ObjectProperty',
    left: kv[0],
    right: kv[1],
    computed: kv[2]
  })
}

function extractObject(d) {
  const output = []
  extractPair(d[2], output)
  for (let i in d[3]) {
    extractPair(d[3][i][3], output)
  }
  return output
}

export function createObjectExpression(d) {
  const properties = d ? extractObject(d) : []
  return {
    type: 'ObjectExpression',
    properties
  }
}

export function createCase(left, right) {
  return {
    type: 'Case',
    left,
    right
  }
}

export function createCases(d) {
  const cases = d[1].map(d => d[1])
  return {
    type: 'Cases',
    cases
  }
}

export function createSelectExpression(condition, cases) {
  return {
    type: 'SelectExpression',
    condition,
    cases
  }
}

export function createMain(declarations, expression) {
  return {
    type: 'Main',
    declarations,
    expression
  }
}

