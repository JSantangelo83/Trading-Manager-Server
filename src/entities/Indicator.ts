import TimeFrame from "../enums/TimeFrames";
import Candle from "../interfaces/Candle";
import IndicatorConfig from "../interfaces/IndicatorConfig";

/**
 * Primitive class of any Indicator
 */
export default abstract class Indicator {
    id: number;
    lastValue: number;
    valueArray: number[];
    formule: (candle: Candle, historicalCandle: Candle[]) => number;
    timeFrame: TimeFrame
    tag: string | undefined
    constructor(indicatorConfig: IndicatorConfig) {
        this.lastValue = 0;
        this.valueArray = [];
        this.formule = indicatorConfig.formule;
        this.timeFrame = indicatorConfig.timeFrame;
        this.id = indicatorConfig.id;
        this.tag = indicatorConfig.tag

    }
    /**
     * Calculates all the indicator historical values and saves it to `lastValue` and `valueArray`.
     * 
     * @param historicalCandles The input candle's array that is used to calculate the historical indicator values
     */
    calculateHistory(historicalCandles: Candle[]) {
        historicalCandles.forEach((historicalCandle, i) => { this.calculateNext(historicalCandle, historicalCandles.slice(0, i)); })
    }
    /**
     * Calculates `lastValue` and appends it to `valueArray`
     * 
     * @param newCandle The input candle that is used to calculate the next indicator value
     */
    calculateNext(newCandle: Candle, historicalCandles: Candle[]) {
        try {
            this.lastValue = this.formule(newCandle, historicalCandles);
        } catch (err) {
            this.valueArray.push(-2);
        }
        this.valueArray.push(this.lastValue);
    }

    /**
     * 
     * @param from quantity of values
     * @returns last indicated values of Indicator
     */
    getLastValues(from: number): number[] { return from > 1 ? this.valueArray.slice(Math.max(this.valueArray.length - from, 0)) : [this.lastValue] }
}