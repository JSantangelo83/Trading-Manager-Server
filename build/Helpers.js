"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Helpers = /** @class */ (function () {
    function Helpers() {
    }
    Helpers.parseBinanceKLines = function (klines) {
        var ret = [];
        for (var _i = 0, klines_1 = klines; _i < klines_1.length; _i++) {
            var kline = klines_1[_i];
            ret.push({
                openTime: kline[0],
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5]),
                closeTime: kline[6],
                quoteAssetVolume: parseFloat(kline[7]),
                numberOfTrades: kline[8],
                takerBuyBaseAssetVolume: parseFloat(kline[9]),
                takerBuyQuoteAssetVolume: parseFloat(kline[10]),
            });
        }
        return ret;
    };
    Helpers.convertAndSave = function (filePath) {
        var fs = require('fs');
        var rawData = JSON.parse(fs.readFileSync(filePath));
        var convertedData = this.parseBinanceKLines(rawData);
        fs.writeFileSync(filePath + 'Converted.json', JSON.stringify(convertedData));
    };
    return Helpers;
}());
exports.default = Helpers;
