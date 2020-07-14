import { parseExpression } from './parse'
import toJS from './toJS'
import transform from './transform'

export default function createCompiler(transforms = [], runtime = {}, debug = false) {
  return string => {
    const { code, globals } = toJS(transform(parseExpression(string), transforms))
    const selfProperties = globals.length ? `${globals.filter(name => name !== '_').map(name => `  const ${name} = _.${name}`).join('\n')}\n` : ''
    const fnCode = `${selfProperties}return ${code}`
    if (debug) {
      console.log(fnCode)
    }
    const fn = new Function('_', fnCode)
    return scope => fn.call(runtime, scope)
  }
}

