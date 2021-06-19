"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var MovingAvaragesTypes_1 = __importDefault(require("../../enums/MovingAvaragesTypes"));
var Indicator_1 = __importDefault(require("../Indicator"));
var MovingAvarage = /** @class */ (function (_super) {
    __extends(MovingAvarage, _super);
    function MovingAvarage(movingAvarageConfig) {
        var _this = this;
        var period = movingAvarageConfig.period;
        var type = movingAvarageConfig.type;
        var indConfig = {};
        var target = movingAvarageConfig.target; //Needs be improved in order to type Candle's keys
        switch (type) {
            case MovingAvaragesTypes_1.default.Simple:
                indConfig.formule = function (candle, historicalCandles) {
                    //TODO Test if any 'candle' hasn't 'target' property. 
                    if (historicalCandles.length >= period) {
                        return (historicalCandles.slice(historicalCandles.length - period + 1).map(function (candle) { return candle[target]; }).reduce(function (vs, v) { return vs + v; }) + candle[target]) / period;
                    }
                    return -1;
                };
                break;
            case MovingAvaragesTypes_1.default.Exponential:
                indConfig.formule = function (candle, historicalCandles) {
                    //TODO Test if any 'candle' hasn't 'target' property. 
                    if (historicalCandles.length > period) {
                        return candle[target] * (2 / (period + 1)) + (_this.valueArray.length ? _this.valueArray[_this.valueArray.length - 1] : historicalCandles[historicalCandles.length - 1][target]) * (1 - (2 / (period + 1)));
                    }
                    return -1;
                };
                break;
            case MovingAvaragesTypes_1.default.Smoothed: break;
            case MovingAvaragesTypes_1.default.LinearWeighted: break;
        }
        indConfig.id = movingAvarageConfig.id;
        indConfig.tag = movingAvarageConfig.tag;
        indConfig.timeFrame = movingAvarageConfig.timeFrame;
        _this = _super.call(this, indConfig) || this;
        return _this;
    }
    return MovingAvarage;
}(Indicator_1.default));
exports.default = MovingAvarage;
