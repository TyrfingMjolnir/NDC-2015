module.exports = function () {
    'use strict';
    
    var config = {
        alljs: [
            './*.js',
            './src/**/*.js',
            './spec/**/*.js'
        ],
        specs: './spec/**/*.js',
        polyfill: './node_modules/gulp-babel/node_modules/babel-core/browser-polyfill.js',
        defaultPort: 8080,
        nodeServer: './src/server/app.js',
        server: './src/server/'
    };
    return config;
};
