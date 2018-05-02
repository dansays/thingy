const webpack = require('webpack');

const config = {
  entry: {
		'add-tasks': './src/add-tasks.js',
		'date-picker': './src/date-picker.js'
	},
	output: {
		filename: '[name].js',
		path: `${__dirname}/dist`
	},
	module: {
		rules: [{
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['@babel/preset-env'],
					plugins: [require('@babel/plugin-proposal-object-rest-spread')]
				}
			}
		}]
	},
	mode: 'none',
	plugins: [
		new webpack.optimize.ModuleConcatenationPlugin()
	]
};

module.exports = config;
