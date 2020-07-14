function isDefined(node) {
  return node !== undefined
}

export default function visit(node, fn, options = {}, parents = [], parent) {
  if (parent) {
    parents.push(parent)
  }
  node = fn(true, node, parents)
  if (node) {
    switch (node.type) {
      case 'TemplateString':
        if (options.skipTemplateStringExpressions) {
          if (node.tag) {
            node = {
              ...node,
              tag: visit(node.tag, fn, options, parents, { key: 'tag', node }),
            }
          }
        } else {
          const expressions = node.expressions.map(expression => visit(expression, fn, options, parents, { key: 'expressions', node })).filter(isDefined)
          if (node.tag) {
            node = {
              ...node,
              tag: visit(node.tag, fn, options, parents, { key: 'tag', node }),
              expressions
            }
          } else {
            node = {
              ...node,
              expressions
            }
          }
        }
        break
      case 'MemberExpression':
        node = {
          ...node,
          object: visit(node.object, fn, options, parents, { key: 'object', node }),
          property: visit(node.property, fn, options, parents, { key: 'property', node })
        }
        break
      case 'MethodExpression':
        node = {
          ...node,
          object: visit(node.object, fn, options, parents, { key: 'object', node }),
          property: visit(node.property, fn, options, parents, { key: 'property', node }),
          args: node.args.map(arg => visit(arg, fn, options, parents, { key: 'args', node })).filter(isDefined)
        }
        break
      case 'CallExpression':
        node = {
          ...node,
          object: visit(node.object, fn, options, parents, { key: 'object', node }),
          args: node.args.map(arg => visit(arg, fn, options, parents, { key: 'args', node })).filter(isDefined)
        }
        break
      case 'UnaryExpression':
        node = {
          ...node,
          right: visit(node.right, fn, options, parents, { key: 'right', node })
        }
        break
      case 'ConditionalExpression':
        node = {
          ...node,
          test: visit(node.test, fn, options, parents, { key: 'test', node }),
          consequence: visit(node.consequence, fn, options, parents, { key: 'consequence', node }),
          alternate: visit(node.alternate, fn, options, parents, { key: 'alternate', node })
        }
        break
      case 'LogicalExpression':
      case 'BinaryExpression':
      case 'ObjectProperty':
      case 'RangeExpression':
        node = {
          ...node,
          left: visit(node.left, fn, options, parents, { key: 'left', node }),
          right: visit(node.right, fn, options, parents, { key: 'right', node })
        }
        break
      case 'Declaration':
      case 'ArrowFunction':
        node = {
          ...node,
          args: node.args.map(arg => visit(arg, fn, options, parents, { key: 'args', node })).filter(isDefined),
          expression: visit(node.expression, fn, options, parents, { key: 'expression', node })
        }
        break
      case 'ArrayExpression':
        node = {
          ...node,
          items: node.items.map(item => visit(item, fn, options, parents, { key: 'items', node })).filter(isDefined)
        }
        break
      case 'ObjectExpression':
        node = {
          ...node,
          properties: node.properties.map(property => visit(property, fn, options, parents, { key: 'properties', node })).filter(isDefined)
        }
        break
      case 'SelectExpression':
        node = {
          ...node,
          condition: visit(node.condition, fn, options, parents, { key: 'condition', node }),
          cases: visit(node.cases, fn, options, parents, { key: 'cases', node })
        }
        break
      case 'Cases':
        node = {
          ...node,
          cases: node.cases.map(property => visit(property, fn, options, parents, { key: 'cases', node })).filter(isDefined)
        }
        break
      case 'Case':
        node = {
          ...node,
          left: node.left ? visit(node.left, fn, options, parents, { key: 'left', node }) : node.left,
          right: visit(node.right, fn, options, parents, { key: 'right', node })
        }
        break
      case 'Main':
        node = {
          ...node,
          declarations: node.declarations.map(declaration => visit(declaration, fn, options, parents, { key: 'declarations', node })).filter(isDefined),
          expression: visit(node.expression, fn, options, parents, { key: 'expression', node })
        }
        break
    }
  }
  node = fn(false, node, parents)
  if (parent) {
    parents.pop()
  }
  return node
}
