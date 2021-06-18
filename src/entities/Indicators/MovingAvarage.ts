import MovingAvaragesTypes from "../../enums/MovingAvaragesTypes";
import Candle from "../../interfaces/Candle";
import IndicatorConfig from "../../interfaces/IndicatorConfig";
import MovingAvaragesConfig from "../../interfaces/Indicators/MovingAvaragesConfig";
import Indicator from "../Indicator";

export default class MovingAvarage extends Indicator {

    constructor(movingAvarageConfig: MovingAvaragesConfig) {
        let period = movingAvarageConfig.period;
        let type = movingAvarageConfig.type;
        let indConfig: IndicatorConfig = <IndicatorConfig>{};
        let target = movingAvarageConfig.target //Needs be improved in order to type Candle's keys
        switch (type) {
            case MovingAvaragesTypes.Simple:
                indConfig.formule = (candle: Candle, historicalCandles: Candle[]) => {
                    //TODO Test if any 'candle' hasn't 'target' property. 
                    if (historicalCandles.length > period) {
                        return historicalCandles.slice(historicalCandles.length - period + 1).map(candle => candle[target]).reduce((vs, v) => vs! + v!)! + candle[target]! / period
                    }
                    return -1
                }; break;
            case MovingAvaragesTypes.Exponential:
                indConfig.formule = (candle: Candle, historicalCandles: Candle[]) => {
                    //TODO Test if any 'candle' hasn't 'target' property. 
                    if (historicalCandles.length > period) {
                        return (candle[target]! * (2 / (period + 1)) + (this.valueArray.length ? this.valueArray[this.valueArray.length - 1] : historicalCandles[historicalCandles.length - 1][target]!) * (1 - (2 / (period + 1))));
                    }
                    return -1
                }; break;
            case MovingAvaragesTypes.Smoothed: break;
            case MovingAvaragesTypes.LinearWeighted: break;
        }

        super(indConfig)
    }
}