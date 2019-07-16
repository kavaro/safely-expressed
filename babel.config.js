module.exports = api => {
  const isTest = api.env('test')
  const presetEnvOptions = isTest ? { targets: { node: 'current' } } : { modules: false }
  return {
    presets: [
      [
        '@babel/preset-env',
        presetEnvOptions
      ],
      '@babel/preset-react'
    ]
  }
}