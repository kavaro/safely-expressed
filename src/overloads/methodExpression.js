import overload from './overload'

export default function overloadMethodExpression(methodName, computed) {
  return overload(
    methodName,
    node => node && node.type === 'MethodExpression' && ((computed === undefined) || computed === !!node.computed),
    node => {
      return [
        node.object,
        node.computed
          ? node.property
          : { ...node.property, type: 'String', value: node.property.value, text: `'${node.property.value}'` },
        { 
          type: 'ArrayExpression', 
          items: node.args 
        }
      ]
    },
    true
  )
}