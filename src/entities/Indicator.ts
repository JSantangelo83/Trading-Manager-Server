import TimeFrame from "../enums/TimeFrames";
import Candle from "../interfaces/Candle";
import IndicatorConfig from "../interfaces/IndicatorConfig";

interface Indicator extends IndicatorConfig { };
/**
 * Primitive class of any Indicator
 */
abstract class Indicator {
    //Runtime Properties
    lastValue: number = 0;
    valueArray: number[] = <number[]>[];
    constructor(config: IndicatorConfig) {
        Object.assign(this, config);

        //Error Handling
        if (!this.formule) { throw new Error('The indicator MUST contain a formule') }
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
            this.lastValue = this.formule!(newCandle, historicalCandles);
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

export default Indicator;