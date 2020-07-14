import operatorExpression from './operatorExpression'
import escape from '../escape'

export default function overloadUnaryExpression(ops) {
  return operatorExpression(
    'UnaryExpression',
    node => {
      return [
        node.right,
        {
          type: 'String',
          value: node.op,
          text: `'${escape(node.op, "'")}'`,
          line: 1,
          col: 1,
          offset: 1
        }
      ]
    },
    ops
  )
}