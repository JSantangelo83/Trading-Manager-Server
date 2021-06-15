"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Primitive class of any Indicator
 */
var Indicator = /** @class */ (function () {
    /**
     * @param inputArray The input array that is used to calculate the indicator's values
     */
    function Indicator(inputArray) {
        /**
         * Last value of the Indicator
         */
        this.value = 0;
        /**
         * All values of the indicator
         */
        this.valueArray = [];
        this.calculate(inputArray);
    }
    /**
     * Calculates the indicator's values and saves it to `value` and `valueArray`
     *
     * @param inputArray The input array that is used to calculate the indicator's values
     */
    Indicator.prototype.calculate = function (inputArray) {
        this.valueArray = inputArray;
        this.value = this.valueArray[this.valueArray.length - 1];
    };
    return Indicator;
}());
exports.default = BaseIndicator;
