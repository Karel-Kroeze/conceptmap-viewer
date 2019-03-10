"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var moment_1 = __importDefault(require("moment"));
var historyPath = path_1.default.resolve(__dirname, "../data/histories.json");
var conceptMapsPath = path_1.default.resolve(__dirname, "../data/conceptMaps.json");
var histories = JSON.parse(fs_1.default.readFileSync(historyPath, 'utf8'));
var conceptMaps = JSON.parse(fs_1.default.readFileSync(conceptMapsPath, 'utf8'));
var actors = Object.keys(histories).map(function (actor) { return { actor: actor }; });
exports.API = express_1.Router();
exports.API.get("/actors", function (req, res) {
    res.json(actors);
});
exports.API.get("/history", function (req, res) {
    var actor = req.query.actor;
    res.json(histories[actor]);
});
exports.API.get("/conceptmap", function (req, res) {
    console.log(req.query);
    var _a = req.query, actor = _a.actor, time = _a.time;
    var maps = conceptMaps.filter(function (m) { return m.actor == actor; });
    var map;
    if (time)
        map = maps.find(function (m) { return m.time == time; });
    maps.sort(function (a, b) { return moment_1.default(b.time).diff(moment_1.default(a.time)); });
    map = map || maps[0];
    res.json(!!map ? map.map : undefined);
});
//# sourceMappingURL=router.js.map