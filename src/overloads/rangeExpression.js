import overload from './overload'

export default function overloadRangeExpression(methodName) {
  return overload(methodName, 'RangeExpression', ['left', 'right'])
}