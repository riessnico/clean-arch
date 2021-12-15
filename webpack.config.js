const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: './src/main/index.tsx',
    output: {
        path: path.join(__dirname, 'public/js'),
        publicPath: '/public/js',
        filename: 'bundle.js'
    },
    resolve: {
        extension: ['.ts', '.tsx', '.js'],
        alias: {
            '@': path.join(__dirname, 'src')
        }
    },
    devServer: {
        static: './public',
        historyApiFallback: true,
        devMiddleware: {
            writeToDisk: true,
        }
  },
    externals: {
        react: 'React',
        'react-dom': 'ReactDom'
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
}