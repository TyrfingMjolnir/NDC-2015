(function () {
    'use strict';
    
    var express = require('express');
    var app = express();
    var port = process.env.PORT || 8080;

    app.use(express.static('src/client'));
    app.use('/lib', express.static('lib'));
    app.use('/src', express.static('src'));
    app.use('/dist', express.static('dist'));

    var server = app.listen(port, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('NDC promises demo app listening at http://%s:%s', host, port);
    });
})();
