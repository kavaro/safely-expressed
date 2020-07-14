import { isObjectLike } from 'lodash'

const { isArray } = Array

export default function createRuntime({ whitelist = [], Range, ...overloads } = {}) {
  whitelist = new Set(whitelist)
  return {
    $get(object, property, args) {
      if (isObjectLike(object) && (object.hasOwnProperty(property) || whitelist.has(property))) {
        return args ? object[property].apply(object, args) : object[property]
      }
    },
    $range(left, includeLeft, right, includeRight) {
      return new Range(left, includeLeft, right, includeRight)
    },
    $in: (left, right) => {
      if (right instanceof Range) {
        if (left instanceof Range) {
          return !(left.max < right.min || left.min > right.max)
        }
        return left >= right.min && left <= right.max
      }
      if (left instanceof Range) {
        return right >= left.min && right <= left.max
      }
      return left === right
    },
    $between: (left, right) => {
      if (right instanceof Range) {
        if (left instanceof Range) {
          return !(left.max <= right.min || left.min >= right.max)
        }
        return left > right.min && left < right.max
      }
      if (left instanceof Range) {
        return right > left.min && right < left.max
      }
      return false
    },
    $equals: (left, right) => {
      if (right instanceof Range) {
        if (left instanceof Range) {
          return left.min === right.min && left.max === right.max
        }
        return left == right.min && left == right.max
      }
      if (left instanceof Range) {
        return right == left.min && right == left.max
      }
      return left === right
    },
    $gt: (left, right) => {
      if (right instanceof Range) {
        if (left instanceof Range) {
          return left.min > right.max
        }
        return left > right.max
      }
      if (left instanceof Range) {
        return left.min > right
      }
      return left > right
    },
    $gte: (left, right) => {
      if (right instanceof Range) {
        if (left instanceof Range) {
          return left.min >= right.max
        }
        return left >= right.max
      }
      if (left instanceof Range) {
        return left.min >= right
      }
      return left >= right
    },
    $lt: (left, right) => {
      if (right instanceof Range) {
        if (left instanceof Range) {
          return left.max < right.min
        }
        return left < right.min
      }
      if (left instanceof Range) {
        return left.max < right
      }
      return left < right
    },
    $lte: (left, right) => {
      if (right instanceof Range) {
        if (left instanceof Range) {
          return left.max <= right.min
        }
        return left <= right.min
      }
      if (left instanceof Range) {
        return left.max <= right
      }
      return left <= right
    },
    ...overloads
  }
}
