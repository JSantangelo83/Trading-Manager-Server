/**
 * Types of signal
 */
export enum SignalTypes {
    /**
     * It is triggered when the first provided indicators is over the second one
     */
    over,
    /**
     * It is triggered when the first provided indicators is under the second one
     */
    under,
    /**
     *  Indicator ascending lows
     *  Price descending lows
     */
    regularBullishDivergency,
    /**
     *  Indicator descending highs
     *  Price ascending highs
     */
    regularBearishDivergency,
    /**
     *  Indicator descending lows
     *  Price ascending lows
     */
    hiddenBullishDivergency,
    /**
     *  Indicator ascending highs
     *  Price descending highs
     */
    hiddenBearishDivergency,
    /**
     *  Indicator static lows
     *  Price ascending lows
     */
    exaggeratedBullishDivergency,
    /**
     *  Indicator static highs
     *  Price descending highs
     */
    exaggeratedBearishDivergency,
    /**
     * It is triggered when the price goes over indicator and then goes under
     */
    pullback,
    /**
     * It is triggered when the price goes under indicator and then goes over
     */
    throwowback,
    /*
    * It is triggered when the indicator shows on the chart
     */
    presency,
}