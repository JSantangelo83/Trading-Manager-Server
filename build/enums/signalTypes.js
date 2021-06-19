"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalTypes = void 0;
/**
 * Types of signal
 */
var SignalTypes;
(function (SignalTypes) {
    /**
     * It is triggered when the first provided indicators is over the second one
     */
    SignalTypes[SignalTypes["over"] = 0] = "over";
    /**
     * It is triggered when the first provided indicators is under the second one
     */
    SignalTypes[SignalTypes["under"] = 1] = "under";
    /**
     *  Indicator ascending lows
     *  Price descending lows
     */
    SignalTypes[SignalTypes["regularBullishDivergency"] = 2] = "regularBullishDivergency";
    /**
     *  Indicator descending highs
     *  Price ascending highs
     */
    SignalTypes[SignalTypes["regularBearishDivergency"] = 3] = "regularBearishDivergency";
    /**
     *  Indicator descending lows
     *  Price ascending lows
     */
    SignalTypes[SignalTypes["hiddenBullishDivergency"] = 4] = "hiddenBullishDivergency";
    /**
     *  Indicator ascending highs
     *  Price descending highs
     */
    SignalTypes[SignalTypes["hiddenBearishDivergency"] = 5] = "hiddenBearishDivergency";
    /**
     *  Indicator static lows
     *  Price ascending lows
     */
    SignalTypes[SignalTypes["exaggeratedBullishDivergency"] = 6] = "exaggeratedBullishDivergency";
    /**
     *  Indicator static highs
     *  Price descending highs
     */
    SignalTypes[SignalTypes["exaggeratedBearishDivergency"] = 7] = "exaggeratedBearishDivergency";
    /**
     * It is triggered when the price goes over indicator and then goes under
     */
    SignalTypes[SignalTypes["pullback"] = 8] = "pullback";
    /**
     * It is triggered when the price goes under indicator and then goes over
     */
    SignalTypes[SignalTypes["throwowback"] = 9] = "throwowback";
    /*
    * It is triggered when the indicator shows on the chart
     */
    SignalTypes[SignalTypes["presency"] = 10] = "presency";
})(SignalTypes = exports.SignalTypes || (exports.SignalTypes = {}));
