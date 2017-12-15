const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    entry: "./core_src/test.ts",
    output: {
        filename: "./tests/bundle.js",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
        ]
    },

    plugins: [
        new UglifyJsPlugin({
          
        })
      ]

    // Other options...
};