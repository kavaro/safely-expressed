export default function escape(string, c) {
  return string.replace(new RegExp(`${c}`, 'g'), (match, offset) => string[offset - 1] !== '\\' ? '\\' + match : match)
}