"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TradingDirections_1 = require("../enums/TradingDirections");
var Strategy = /** @class */ (function () {
    function Strategy(config) {
        var _this = this;
        /** Sends a short operation */
        this.makeShort = function () {
            console.log('putting Short on candle: ', _this.actualCandle);
            console.log('Time: ', _this.actualCandle.closeTime);
        };
        /** Sends a long operation */
        this.makeLong = function () {
            console.log('putting Long on candle: ', _this.actualCandle);
            console.log('Time: ', _this.actualCandle.closeTime);
        };
        this.signals = config.signals;
        this.pairs = config.pairs;
        this.url = config.url;
        this.timedCandles = config.timedCandles;
        this.startTime = config.startTime || 200;
        this.timeFrame = config.timeFrame;
        /** Indicators contained of strategy (obtained from Signals)*/
        this.indicators = [];
        /** Last checked candle */
        this.actualCandle = {};
        /** Candles until `actualCandle` */
        this.historicalCandles = [];
        /** Loading indicators from Signals */
        this.signals.forEach(function (signal) {
            signal.indicators.forEach(function (indicator) {
                //Looking for duplicated Indicators
                if (!_this.indicators.map(function (indicator) { return indicator.id; }).includes(indicator.id)) {
                    _this.indicators.push(indicator);
                }
                ;
            });
        });
        this.initializeStrategy();
    }
    /** Loads historical values of indicators. Then start listening to websocket if any */
    Strategy.prototype.initializeStrategy = function () {
        var _this = this;
        if (this.url) {
            //TODO handle urls
        }
        else if (this.timedCandles && this.startTime) {
            if (Object.keys(this.timedCandles).length > 1) {
                //Handle Multi-TimeFrames
            }
            else {
                this.historicalCandles = [{ timeFrame: this.timedCandles[0].timeFrame, candles: this.timedCandles[0].candles.filter(function (c) { return c.closeTime <= _this.startTime; }) }];
                var futureCandles = [{ timeFrame: this.timedCandles[0].timeFrame, candles: this.timedCandles[0].candles.filter(function (c) { return c.closeTime > _this.startTime; }) }];
                this.indicators.forEach(function (indicator) { return indicator.calculateHistory(_this.historicalCandles[0].candles); });
                futureCandles[0].candles.forEach(function (candle) {
                    _this.actualCandle = candle;
                    _this.updateIndicators();
                    _this.checkSignals();
                    _this.historicalCandles[0].candles.push(candle);
                });
                //SAVE INDICATOR VALUES
                this.indicators.forEach(function (indicator) {
                    var fs = require('fs');
                    fs.writeFileSync('TMP }' + (indicator.tag || 'indicator' + indicator.id), JSON.stringify(indicator.valueArray).replace('[', '').replace(']', ''));
                });
                //SAVE SIGNAL VALUES
                // this.signals.forEach((signal, i) => {
                //     let fs = require('fs')
                //     fs.writeFileSync('TMP signal ' + i, JSON.stringify(signal.test))
                // })
            }
        }
        else {
            throw new Error('Must give an url or candles');
        }
    };
    /** Updates all the indicator's values */
    Strategy.prototype.updateIndicators = function () {
        var _this = this;
        this.indicators.forEach(function (indicator) {
            indicator.calculateNext(_this.actualCandle, _this.historicalCandles.filter(function (tc) { return tc.timeFrame == indicator.timeFrame; })[0].candles);
        });
    };
    /** Checks the state of the signals and triggers operations */
    Strategy.prototype.checkSignals = function () {
        var shortSignalStates = this.signals.map(function (signal) { return signal.direction === TradingDirections_1.TradingDirections.Short ? signal.getState() : undefined; }).filter(function (el) { return el != undefined; });
        var longSignalStates = this.signals.map(function (signal) { return signal.direction === TradingDirections_1.TradingDirections.Long ? signal.getState() : undefined; }).filter(function (el) { return el != undefined; });
        if (!shortSignalStates.includes(false)) {
            this.makeShort();
        }
        if (!longSignalStates.includes(false)) {
            this.makeLong();
        }
    };
    return Strategy;
}());
exports.default = Strategy;
