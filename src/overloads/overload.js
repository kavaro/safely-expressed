import { isFunction } from 'lodash/lang'

export default function overload(method, type, args) {
  const match = node => isFunction(type) ? type(node) : node && node.type === type
  const exec = node => {
    const { line, col, offset } = node
    const methodName = isFunction(method) ? method(node) : method
    /* istanbul ignore else */
    if (methodName) {
      node = {
        type: 'CallExpression',
        object: {
          type: 'Identifier',
          value: methodName,
          text: methodName,
          line,
          col,
          offset
        },
        args: isFunction(args) ? args(node) : args.map(key => node[key])
      }
    }
    return node
  }
  return { match, exec }
}