var path = require('path');

module.exports = {
    entry: './app/js/renderer.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist',
        filename: 'bundle.js',
    },
    module: {

    }
};