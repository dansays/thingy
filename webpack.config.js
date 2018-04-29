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
	mode: 'none',
	plugins: [
		new webpack.optimize.ModuleConcatenationPlugin()
	]
};

module.exports = config;
