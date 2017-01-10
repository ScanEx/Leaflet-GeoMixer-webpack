var webpack = require('webpack');
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = {
	isWebPack: true,
    entry: "./src/includes.js",
    output: {
        filename: "./dist/geomixer.js"
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {        
        extensions: ["", ".webpack.js", ".web.js", ".js", ".jsx"]
    },

    module: {
        preLoaders: [
            // Javascript
			{test: /\.js$/, loaders: [ "babel-loader", "eslint-loader" ], exclude: ["/node_modules/", "/src\/includes.js/"]}
        ],
        loaders: [            
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },

    externals: {
    },

    eslint: {
		configFile: './.eslintrc',
        failOnWarning: false,
        failOnError: true
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new UnminifiedWebpackPlugin({
            postfix: 'src'//specify "nomin" postfix 
        })
	]
};