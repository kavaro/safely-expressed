export class Range {
  constructor(left, right) {
    this.from = Math.min(left, right)
    this.to = Math.max(left, right)
  }
}

export default function $range(left, right) {
  return new Range(left, right)
}
