import visit from './visit'

export default function toString(ast) {
  function generateParenthesis(node, string) {
    if (node && node.parenthesis) {
      return `(${string})`
    }
    return string
  }

  function generateTemplateString(node) {
    const { strings, expressions } = node
    let result = []
    strings.forEach((string, i) => {
      result.push(string)
      const expression = expressions[i]
      if (expression) {
        result.push(`{${expression}}`)
      }
    })
    result = `\`${result.join('')}\``
    return node.tag ? `${node.tag}${result}` : result
  }

  return visit(ast, (before, node) => {
    if (!before && node) {
      let result
      switch (node.type) {
        case 'MemberExpression':
          result = node.computed ? `${node.object}[${node.property}]` : `${node.object}.${node.property}`
          break
        case 'MethodExpression':
          result = node.computed ? `${node.object}[${node.property}](${node.args.join(', ')})` : `${node.object}.${node.property}(${node.args.join(', ')})`
          break
        case 'CallExpression':
          result = `${node.object}(${node.args.join(', ')})`
          break
        case 'UnaryExpression':
          result = `${node.op}${node.right}`
          break
        case 'ConditionalExpression':
          result = `${node.test} ? ${node.consequence} : ${node.alternate}`
          break
        case 'LogicalExpression':
        case 'BinaryExpression':
          result = `${node.left} ${node.op} ${node.right}`
          break
        case 'RangeExpression':
          result = `[${node.left}...${node.right}]`
          break
        case 'ArrowFunction':
          result = `(${node.args.join(', ')}) => ${node.expression}`
          break
        case 'Declaration':
          result = `${node.name.value}(${node.args.join(', ')}) => ${node.expression};`
          break
        case 'ArrayExpression':
          result = `[${node.items.join(', ')}]`
          break
        case 'ObjectProperty':
          result = node.computed ? `[${node.left}]: ${node.right}` : `${node.left}: ${node.right}`
          break
        case 'ObjectExpression':
          result = `{${node.properties.join(', ')}}`
          break
        case 'Case':
          result = node.left ? `WHEN ${node.left} THEN ${node.right}` : `DEFAULT ${node.right}`
          break
        case 'Cases':
          result = node.cases.join(' ')
          break
        case 'SelectExpression':
          result = `SELECT(${node.condition}) { ${node.cases} }`
          break
        case 'Main':
          result = `${node.declarations.join('')}${node.expression || ''}`
          break
        case 'String':
          result = node.text
          break
        case 'TemplateString':
          result = generateTemplateString(node)
          break
        default:
          result =
            node.value === null ? 'NULL'
              : node.value === true ? 'TRUE'
                : node.value === false ? 'FALSE'
                  : node.value.toString()
      }
      return generateParenthesis(node, result)
    }
    return node
  })
}
