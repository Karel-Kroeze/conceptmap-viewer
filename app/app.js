"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path_1 = __importDefault(require("path"));
var router_1 = require("./router");
exports.app = express();
var staticPath = path_1.default.resolve(__dirname, '../dist');
console.log({ staticPath: staticPath });
exports.app.use(express.urlencoded({ extended: false }));
exports.app.use('/', express.static(staticPath));
exports.app.use('/api', router_1.API);
var port = 3000;
exports.app.listen(port, function () { return console.log("CM Viewer listening on " + port + "!"); });
//# sourceMappingURL=app.js.map