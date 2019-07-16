import operatorExpression from './operatorExpression'

export default function overloadLogicalExpression(ops) {
  return operatorExpression('BinaryExpression', ['left', 'right'], ops)
}