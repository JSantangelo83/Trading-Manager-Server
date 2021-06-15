"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signalTypes = void 0;
/**
 * Types of signal
 */
var signalTypes;
(function (signalTypes) {
    /**
     * It is triggered when the first provided indicators is over the second one
     */
    signalTypes[signalTypes["over"] = 0] = "over";
    /**
     * It is triggered when the first provided indicators is under the second one
     */
    signalTypes[signalTypes["under"] = 1] = "under";
    /**
     *  Indicator ascending lows
     *  Price descending lows
     */
    signalTypes[signalTypes["regularBullishDivergency"] = 2] = "regularBullishDivergency";
    /**
     *  Indicator descending highs
     *  Price ascending highs
     */
    signalTypes[signalTypes["regularBearishDivergency"] = 3] = "regularBearishDivergency";
    /**
     *  Indicator descending lows
     *  Price ascending lows
     */
    signalTypes[signalTypes["hiddenBullishDivergency"] = 4] = "hiddenBullishDivergency";
    /**
     *  Indicator ascending highs
     *  Price descending highs
     */
    signalTypes[signalTypes["hiddenBearishDivergency"] = 5] = "hiddenBearishDivergency";
    /**
     *  Indicator static lows
     *  Price ascending lows
     */
    signalTypes[signalTypes["exaggeratedBullishDivergency"] = 6] = "exaggeratedBullishDivergency";
    /**
     *  Indicator static highs
     *  Price descending highs
     */
    signalTypes[signalTypes["exaggeratedBearishDivergency"] = 7] = "exaggeratedBearishDivergency";
    /**
     * It is triggered when the price goes over indicator and then goes under
     */
    signalTypes[signalTypes["pullback"] = 8] = "pullback";
    /**
     * It is triggered when the price goes under indicator and then goes over
     */
    signalTypes[signalTypes["throwowback"] = 9] = "throwowback";
    /*
    * It is triggered when the indicator shows on the chart
     */
    signalTypes[signalTypes["presency"] = 10] = "presency";
})(signalTypes = exports.signalTypes || (exports.signalTypes = {}));
