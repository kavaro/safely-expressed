import nearley from 'nearley'
import grammar from './grammar.js'
import visit from './visit'

const compiledGrammar = nearley.Grammar.fromCompiled(grammar)

export default function parseGrammar(string) {
  const parser = new nearley.Parser(compiledGrammar)
  parser.feed(string)
  const { results } = parser
  /* istanbul ignore if */
  if (results.length > 1) {
    throw new Error('Ambiguous')
  }
  /* istanbul ignore if */
  if (!results.length) {
    throw new Error('Error: unexpected end of input')
  }
  return results[0]
}

export function indexOf(string, regexp, fromIndex) {
  const index = string.slice(fromIndex).search(regexp)
  if (index === -1) {
    return -1
  }
  return index + fromIndex
}

export function clean(characters, begin, end) {
  while (begin < end) {
    const c = characters[begin]
    if (!/[\n\r\t\f]/.test(c)) {
      characters[begin] = ' '
    }
    begin++
  }
}

// begin = (index of opening ` character) + 1 = index of first string character
// end = index of closing ` character = (index of last string character) + 1 or characters.length
export function parseTemplateString(string, begin = 0) {
  let index = begin - 1
  let stringBegin = begin
  const node = { type: 'TemplateString', strings: [], expressions: [], begin }
  const { strings, expressions } = node
  while (true) {
    index = indexOf(string, /[{`]/, index + 1)
    const escaped = string[index - 1] === '\\'
    const c = string[index]
    if (index === -1 || (!escaped && c === '`')) {
      if (index === -1) {
        index = string.length
      }
      strings.push(string.slice(stringBegin, index))
      break
    }
    if (!escaped && c === '{') {
      strings.push(string.slice(stringBegin, index))
      const expression = parseExpression(string, index + 1)
      expressions.push(expression)
      index = expression.end
      stringBegin = index + 1
    }
  }
  node.end = index
  return node
}

export function indexOfEndOfString(string, begin, c) {
  let index = begin - 1
  while (true) {
    index = string.indexOf(c, index + 1)
    /* istanbul ignore if */
    if (index === -1) {
      return string.length
    }
    if (string[index - 1] !== '\\') {
      return index + 1
    }
  }
}

// begin = index of first expression character
// end = (index of last expression character) + 1 or characters.length
export function parseExpression(string, begin = 0) {
  const templateStrings = []
  const comments = []
  let index = begin - 1, objectDepth = 0
  while (true) {
    index = indexOf(string, /['"`{}]|\/\*|\/\//, index + 1)
    if (index === -1) {
      index = string.length
      break
    }
    const c = string[index]
    if (c === '}' && !objectDepth) {
      break
    }
    switch (c) {
      case '/':
        // detect // and /* */ comments
        const comment = { begin: index }
        index = indexOf(string, string[index + 1] === '*' ? /\*\// : /\r\n|\r|\n/, index + 2)
        if (index === -1) {
          index = comment.end = string.length
        } else {
          index++
          comment.end = index + 1
        }
        comments.push(comment)
        break
      case '"':
      case "'":
        index = indexOfEndOfString(string, index + 1, c)
        break
      case '`':
        const templateString = parseTemplateString(string, index + 1)
        templateStrings.push(templateString)
        index = templateString.end
        break
      case '{':
        objectDepth++
        break
      case '}':
        objectDepth--
        break
    }
  }
  const end = index
  let characters = string.slice().split('')
  clean(characters, 0, begin)
  const offsets = {}
  templateStrings.forEach(templateString => {
    offsets[templateString.begin - 1] = templateString
    clean(characters, templateString.begin, templateString.end)
  })
  comments.forEach(comment => clean(characters, comment.begin, comment.end))
  clean(characters, end, string.length)
  const expression = characters.join('')
  let ast = parseGrammar(expression)
  ast.begin = begin
  ast.end = end

  return visit(ast, (begin, node) => {
    if (begin) {
      if (node && node.type === 'TemplateString') {
        const { strings, expressions } = offsets[node.offset]
        return {
          ...node,
          strings,
          expressions
        }
      }
    }
    return node
  }, { skipTemplateStringExpressions: true })
}



