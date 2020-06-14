"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path_1 = __importDefault(require("path"));
var router_1 = require("./router");
var request_1 = __importDefault(require("request"));
exports.app = express();
var staticPath = path_1.default.resolve(__dirname, '../dist');
console.log({ staticPath: staticPath });
exports.app.use(express.urlencoded({ extended: false }));
exports.app.use('/', express.static(staticPath));
exports.app.use('/api', router_1.API);
// pass on requests meant for graasp
// https://gist.github.com/mrded/540aa79a42f74a4911e8
exports.app.use('/graasp', function (req, res) {
    console.log("Forwarding request for " + req.originalUrl + " to http://graasp.eu/api/ils" + req.url);
    req.pipe(request_1.default("http://graasp.eu/api/ils" + req.url)).pipe(res);
});
var port = 3000;
exports.app.listen(port, function () { return console.log("CM Viewer listening on " + port + "!"); });
//# sourceMappingURL=app.js.map