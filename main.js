"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var express = require("express");
var session = require("express-session");
var os = require("os");
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
}));
var http = require('http');
var httpServer = http.createServer(app);

/* WARNING! do not add this to your SITE! this is just unit tests for drawing and WILL expose backend files */
app.get(/^(.+)$/, function (req, res) {
    try {
        var final_path = __dirname + '/' + req.params[0];
        if (fs.lstatSync(final_path).isDirectory() || !fs.lstatSync(final_path).isFile()) {
            res.status(403).send('sorry');
        }
        else {
            res.sendFile(path.resolve(final_path));
        }
    }
    catch (err) {
        res.status(403).send('sorry');
    }
});

httpServer.listen(8787);