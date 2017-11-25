const path = require('path')

module.exports = {
  context: path.join(__dirname, '/src'),
  entry: {
    index: ['babel-polyfill', './index.jsx']
  },
  output: {
    path: path.join(__dirname, '/build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader'
      }
    ]
  },
  resolve: {
    modules: ['node_modules', path.resolve('/src')],
    extensions: ['.js', '.jsx']
  },
  devServer: {
    contentBase: 'front/build',
    inline: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000/',
        secure: false
      }
    }
  },
  devtool: 'source-map'
}
