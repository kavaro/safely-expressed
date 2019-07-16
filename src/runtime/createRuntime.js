import Range from './Range'

export default function createRuntime({whitelist = []} = {}) {
  whitelist = isArray(whitelist) ? whitelist.reduce((obj, property) => {
    obj[property] = true
    return obj
  }, {}) : {}

  return class Runtime {
    constructor(doc) {
      Object.assign(this, doc)
    }

    $get(object, property, args) {
      if (isObjectLike(object) && (object.hasOwnProperty(property) || whitelist[property])) {
        if (object.hasOwnProperty(property) || whitelist[property]) {
          return args ? object[property].apply(object, args) : object[property]
        }
      }
    }

    $range(left, right) {
      return new Range(left, right)
    }
  }
}
