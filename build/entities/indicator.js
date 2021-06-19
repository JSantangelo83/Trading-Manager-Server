"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Primitive class of any Indicator
 */
var Indicator = /** @class */ (function () {
    function Indicator(indicatorConfig) {
        this.lastValue = 0;
        this.valueArray = [];
        this.formule = indicatorConfig.formule;
        this.timeFrame = indicatorConfig.timeFrame;
        this.id = indicatorConfig.id;
        this.tag = indicatorConfig.tag;
    }
    /**
     * Calculates all the indicator historical values and saves it to `lastValue` and `valueArray`.
     *
     * @param historicalCandles The input candle's array that is used to calculate the historical indicator values
     */
    Indicator.prototype.calculateHistory = function (historicalCandles) {
        var _this = this;
        historicalCandles.forEach(function (historicalCandle, i) { _this.calculateNext(historicalCandle, historicalCandles.slice(0, i)); });
    };
    /**
     * Calculates `lastValue` and appends it to `valueArray`
     *
     * @param newCandle The input candle that is used to calculate the next indicator value
     */
    Indicator.prototype.calculateNext = function (newCandle, historicalCandles) {
        try {
            this.lastValue = this.formule(newCandle, historicalCandles);
        }
        catch (err) {
            this.valueArray.push(-2);
        }
        this.valueArray.push(this.lastValue);
    };
    /**
     *
     * @param from quantity of values
     * @returns last indicated values of Indicator
     */
    Indicator.prototype.getLastValues = function (from) { return from > 1 ? this.valueArray.slice(Math.max(this.valueArray.length - from, 0)) : [this.lastValue]; };
    return Indicator;
}());
exports.default = Indicator;
