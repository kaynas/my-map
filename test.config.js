module.exports = {
    entry: './src/test/test.map.js',
    output: {
        filename: 'test/bundle.js'
    },
    mode: 'none',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            }
        ]
    }
};