export default class Range {
  constructor(left, right) {
    const [min, max] = left > right ? [right, left] : [left, right]
    this.min = min
    this.max = max
  }
}

