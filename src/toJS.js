import visit from './visit'
import escape from './escape'

export default function toJS(ast) {
  function generateParenthesis(node, string) {
    if (node && node.parenthesis) {
      return `(${string})`
    }
    return string
  }

  function generateTemplateString(node) {
    const { strings, expressions } = node
    let result = []
    if (node.tag) {
      throw new Error(`TaggedTemplateString requires overloadTaggedTemplateString transform`)
    } else {
      strings.forEach((string, i) => {
        result.push(`'${escape(string, "'")}'`)
        const expression = expressions[i]
        if (expression) {
          //result.push(`((function() {${expression}})())`)
          result.push(`(${expression})`)
        }
      })
      result = result.join(' + ')
    }
    return result
  }

  function isGlobalVariable(parents, value) {
    for (let parent of parents) {
      const { node } = parent
      const { type } = node
      if (type === 'ArrowFunction' || type === 'Declaration') {
        for (let arg of node.args) {
          if (value === arg.value) {
            return false
          }
        }
      }
      if (type === 'Main') {
        for (let declaration of node.declarations) {
          if (declaration.name.value === value) {
            return false
          }
        }
      }
    }
    return true
  }

  function transform(ast) {
    const globals = {}
    ast = visit(ast, (before, node, parents) => {
      if (node) {
        if (before) {
          if (node.type === 'Identifier') {
            const parent = parents[parents.length - 1]
            const parentNode = parent.node
            const isProperty =
              parentNode &&
              (parentNode.type === 'MemberExpression' || parentNode.type === 'MethodExpression') &&
              node === parentNode.property
            const isGlobal = !isProperty && isGlobalVariable(parents, node.value)
            const isCall =
              parentNode &&
              parentNode.type === 'CallExpression' &&
              parentNode.object === node
            if (isGlobal && !isCall) {
              globals[node.value] = true
            }
            node = {
              ...node,
              isProperty,
              isGlobal,
              isCall
            }
          }
        } else {
          switch (node.type) {
            case 'CallExpression':
              node = {
                ...node,
                isGlobal: node.object.isGlobal
              }
              break
          }
        }
      }
      return node
    })
    return { ast, globals }
  }

  function generate({ast, globals}) {
    const code = visit(ast, (before, node) => {
      if (node) {
        if (before) {
        } else {
          let result
          switch (node.type) {
            //case 'CommaExpression':
            //  result = node.expressions.join(', ')
            //  break
            case 'MemberExpression':
              result = node.computed ? `${node.object}[${node.property}]` : `${node.object}.${node.property}`
              break
            case 'MethodExpression':
              result = node.computed ? `${node.object}[${node.property}](${node.args.join(', ')})` : `${node.object}.${node.property}(${node.args.join(', ')})`
              break
            case 'CallExpression':
              result = `${node.isGlobal ? `self.${node.object}` : node.object}(${node.args.join(', ')})`
              break
            case 'UnaryExpression':
              result = `${node.op}${node.right}`
              break
            case 'ConditionalExpression':
              result = `${node.test} ? ${node.consequence} : ${node.alternate}`
              break
            case 'LogicalExpression':
              result = `${node.left} ${node.op} ${node.right}`
              break
            case 'BinaryExpression':
              result = `${node.left} ${node.op} ${node.right}`
              break
            case 'RangeExpression':
              throw new Error(`RangeExpression requires overloadRangeExpression transform`)
            case 'ArrowFunction':
              result = `function (${node.args.join(', ')}) { return ${node.expression}; }`
              break
            case 'Declaration':
              result = `function ${node.name.value}(${node.args.join(', ')}) { return ${node.expression}; }`
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
              result = node.left 
                ? {code: `($c === ${node.left}) ? ${node.right}`, default: false} 
                : {code: `${node.right}`, default: true}
              break
            case 'Cases':
              const defaultCode = node.cases.filter(Case => Case.default).map(Case => Case.code)[0] || 'undefined'
              const conditionsCode = node.cases.filter(Case => !Case.default).map(Case => Case.code).concat([defaultCode])
              result = conditionsCode.join(' : ')
              break
            case 'SelectExpression':
              result = `((function() { var $c = ${node.condition}; return ${node.cases} })())`
              break
            case 'Main':
              result = `(function() {${node.declarations.join('')}  return ${node.expression || 'undefined'};})()`
              break
            case 'String':
              result = node.text
              break
            case 'TemplateString':
              result = generateTemplateString(node)
              break
            case 'Identifier':
              result = node.value.toString()
              break
            default:
              if (node.type === 'Literal' && node.value === 'THIS') {
                return 'self'
              }
              result =
                node.value === null ? 'null'
                  : node.value === true ? 'true'
                    : node.value === false ? 'false'
                      : node.value.toString()
          }
          return generateParenthesis(node, result)
        }
        return node
      }
    })
    return {code, globals: Object.keys(globals)}
  }

  return generate(transform(ast))
}

