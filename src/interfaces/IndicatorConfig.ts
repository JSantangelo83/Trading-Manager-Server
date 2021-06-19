import TimeFrame from "../enums/TimeFrames";
import Candle from "./Candle";
import Entity from "./Entity";

export default interface IndicatorConfig extends Entity {
    /** 
     * Calculates next value of the indicator.
     * Should not change `lastValue` or `valueArray`. Just reads it and uses to calculate a number.
     * 
     * @returns value, or -1 if cannot be calculated.
     */
    formule: (candle: Candle, historicalCandles: Candle[]) => number
    /** Time Frame of the indicator */
    timeFrame: TimeFrame
}