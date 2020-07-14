import overload from './overload'
import escape from '../escape'

export default function overloadTaggedTemplateString() {
  return overload(
    node => node.tag.value,
    node => node && node.type === 'TemplateString' && node.tag,
    node => {
      const { strings, expressions } = node
      return [{
        type: 'ArrayExpression',
        items: strings.map(string => ({
          type: 'String',
          value: string,
          text: `'${escape(string, "'")}'`,
          line: 1,
          col: 1,
          offset: 1
        }))
      }].concat(expressions)
    },
    false
  )
}