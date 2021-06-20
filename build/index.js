"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var MovingAvarage_1 = __importDefault(require("./entities/Indicators/MovingAvarage"));
var Strategy_1 = __importDefault(require("./entities/Strategy"));
var MovingAvaragesTypes_1 = __importDefault(require("./enums/MovingAvaragesTypes"));
var Signal_1 = __importDefault(require("./entities/Signal"));
var TradingDirections_1 = require("./enums/TradingDirections");
var SignalTypes_1 = require("./enums/SignalTypes");
var TimeFrames_1 = __importDefault(require("./enums/TimeFrames"));
var Helpers_1 = __importDefault(require("./Helpers"));
var app = express_1.default();
var PORT = 3000;
app.get('/', function (req, res) {
    res.send('test passed');
});
app.get('/convert', function (req, res) {
    Helpers_1.default.convertAndSave('./src/TestingData/BtcUsdt1h.json');
    res.send('todo piola :D');
});
app.get('/test', function (req, res) {
    var slowEma = new MovingAvarage_1.default({
        id: 0,
        tag: 'slow',
        period: 200,
        type: MovingAvaragesTypes_1.default.Simple,
        target: 'close',
        timeFrame: TimeFrames_1.default['1h'],
    });
    var fastEma = new MovingAvarage_1.default({
        id: 1,
        tag: 'fast',
        period: 20,
        type: MovingAvaragesTypes_1.default.Simple,
        target: 'close',
        timeFrame: TimeFrames_1.default['1h'],
    });
    var exponentialEma = new MovingAvarage_1.default({
        id: 1,
        tag: 'exponential',
        period: 20,
        type: MovingAvaragesTypes_1.default.Exponential,
        target: 'close',
        timeFrame: TimeFrames_1.default['1h'],
    });
    var longSignal = new Signal_1.default({
        direction: TradingDirections_1.TradingDirections.Long,
        indicators: [fastEma, slowEma],
        type: SignalTypes_1.SignalTypes.over
    });
    var shortSignal = new Signal_1.default({
        direction: TradingDirections_1.TradingDirections.Short,
        indicators: [slowEma, fastEma],
        type: SignalTypes_1.SignalTypes.over
    });
    var fs = require('fs');
    var candles = JSON.parse(fs.readFileSync('./src/TestingData/BtcUsdt1hConverted.json'));
    var doubleEmaStrategy = new Strategy_1.default({
        signals: [longSignal, shortSignal],
        timeFrame: TimeFrames_1.default['1h'],
        timedCandles: [{
                timeFrame: TimeFrames_1.default['1h'],
                candles: candles
            }],
        startTime: 1621735200000,
    });
    res.send('already did everything');
});
app.listen(PORT, function () { return console.log("Server listening on Port " + PORT); });
