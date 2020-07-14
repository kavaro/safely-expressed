import overload from './overload'

export default function overloadOperatorExpression(type, args, ops) {
  return overload(
    node => ops[node.op],
    node => node && node.type === type && ops[node.op],
    args,
    true
  )
}