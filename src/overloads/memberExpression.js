import overload from './overload'

export default function overloadMemberExpression(methodName, computed) {
  return overload(
    methodName,
    node => node && node.type === 'MemberExpression' && ((computed === undefined) || computed === !!node.computed),
    node => [
      node.object,
      node.computed
        ? node.property
        : { ...node.property, type: 'String', value: node.property.value, text: `'${node.property.value}'` }
    ]
  )
}