const Path = require('path');

module.exports = {
  mode: 'none',
  target: 'web',
  entry: './src/main.ts',
  output: {
    path: Path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        exclude: /node_modules/,
        use: 'worker-loader'
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  },
  watchOptions: {
    poll: 1000,
    aggregateTimeout: 30,
    ignored: /node_modules/
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: Path.join(__dirname, 'public')
    },
    historyApiFallback: true,
    compress: true,
    port: 8080
  }
};
