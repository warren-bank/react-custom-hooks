const path         = require('path')
const webpack      = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
   entry: './src/app/index.js',
    output: {
        path: path.resolve(__dirname, 'dist', 'js'),
        filename: 'bundle.js',
        sourceMapFilename: 'bundle.map'
    },
    devtool: '#source-map',
    resolve: {
        modules: [
            path.resolve('./src'),
            path.resolve('./node_modules'),
            path.resolve('../../node_modules')
        ],
        alias: {
            "@warren-bank/unified-redux-react-hook": 'unified-redux-react-hook.js',
            "react":                                 'react.js',
            "react-dom":                             'react-dom.js',
            "redux":                                 'redux.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                sourceMap: true,
                terserOptions: {
                    warnings: false,
                    mangle: true
                }
            })
        ],
    },
    mode: 'production',
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify('production')
            }
        })
    ]
}
