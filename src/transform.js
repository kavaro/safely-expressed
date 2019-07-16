import visit from './visit'

export default function transform(ast, transforms = []) {
  if (transforms.length) {
    ast = visit(ast, (before, node, parents, path) => {
      if (!before) {
        transforms.forEach(({ match, exec }) => {
          if (match(node, parents, path)) {
            node = exec(node, parents, path)
          }
        })
      }
      return node
    })
  }
  return ast
}