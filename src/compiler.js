import { parseExpression } from './parse'
import toJS from './toJS'
import transform from './transform'

export default function createCompiler(transforms) {
  return string => {
    const { code, globals } = toJS(transform(parseExpression(string), transforms))
    const selfProperties = globals.length ? `${globals.map(name => `  const ${name} = self.${name}`).join('\n')}\n` : ''
    const fn = new Function('self', `${selfProperties}return ${code}`)
    //console.log(fn.toString())
    return self => fn(self)
  }
}

