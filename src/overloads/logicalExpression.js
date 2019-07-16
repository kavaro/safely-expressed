import operatorExpression from './operatorExpression'

export default function overloadLogicalExpression(ops) {
  return operatorExpression('LogicalExpression', ['left', 'right'], ops)
}