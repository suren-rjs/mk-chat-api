const path = require('path');
const http = require('stream-http');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            util: require.resolve('util/'),
            buffer: require.resolve('buffer/'),
            zlib: require.resolve("browserify-zlib"),
            querystring: require.resolve('querystring-es3'),
            path: require.resolve('path-browserify'),
            http: require.resolve('stream-http'),
            url: require.resolve('url/'),
            fs: false,
        }
    },
    node: {
        __dirname: false,
        __filename: false,
    },
};
