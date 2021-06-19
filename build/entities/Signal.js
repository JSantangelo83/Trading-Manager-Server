"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SignalTypes_1 = require("../enums/SignalTypes");
/*
* Triggers callback on condition
*/
var Signal = /** @class */ (function () {
    function Signal(config) {
        this.state = false;
        this.type = config.type;
        this.indicators = config.indicators;
        this.direction = config.direction;
        this.margin = config.margin ? config.margin : 1;
        this.duration = config.duration ? config.duration : 10;
        if (this.duration < this.margin)
            throw new Error('Duration of signal cannot be smaller than margin');
    }
    Signal.prototype.calculateState = function () {
        if (this.type == SignalTypes_1.SignalTypes.over || this.type == SignalTypes_1.SignalTypes.under) {
            if (this.indicators.length < 2)
                throw new Error('Must provide 2 indicators to "over" and "under" Signal type');
            var marginArr0 = this.indicators[0].getLastValues(this.margin);
            var marginArr1_1 = this.indicators[1].getLastValues(this.margin);
            var marginFilter = this.type == SignalTypes_1.SignalTypes.over ? function (v, i) { return v > marginArr1_1[i]; } : function (v, i) { return v < marginArr1_1[i]; };
            var byMargin = marginArr0.every(marginFilter);
            var byDuration = true;
            if (this.duration) {
                var durationArr0 = this.indicators[0].getLastValues(this.margin + this.duration + 1);
                var durationArr1_1 = this.indicators[1].getLastValues(this.margin + this.duration + 1);
                var durationFilter = this.type == SignalTypes_1.SignalTypes.over ? function (v, i) { return v > durationArr1_1[i]; } : function (v, i) { return v < durationArr1_1[i]; };
                byDuration = !durationArr0.every(durationFilter);
            }
            this.state = (byMargin && byDuration);
        }
        this.state = false;
    };
    Signal.prototype.getState = function () {
        this.calculateState();
        return this.state;
    };
    return Signal;
}());
exports.default = Signal;
