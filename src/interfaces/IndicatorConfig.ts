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
    formule?: (candle: Candle, historicalCandles: Candle[]) => number
    /** Time Frame of the indicator */
    timeFrame?: TimeFrame,
    /** The period of the indicator (if it needs one) */
    period?: number,
    /** The source of the indicator */
    source?: "close" | "high" | "low"; //Needs to improve
}