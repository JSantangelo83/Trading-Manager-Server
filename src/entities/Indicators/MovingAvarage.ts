import MovingAvaragesTypes from "../../enums/MovingAvaragesTypes";
import Candle from "../../interfaces/Candle";
import IndicatorConfig from "../../interfaces/IndicatorConfig";
import MovingAvaragesConfig from "../../interfaces/Indicators/MovingAvaragesConfig";
import Indicator from "../Indicator";

export default class MovingAvarage extends Indicator {
    constructor(config: MovingAvaragesConfig) {
        let _this: MovingAvaragesConfig = <MovingAvaragesConfig>{};
        Object.assign(_this, config);

        switch (_this.type) {
            case MovingAvaragesTypes.Simple:
                _this.formule = (candle: Candle, historicalCandles: Candle[]) => {
                    //TODO Test if any 'candle' hasn't 'target' property. 
                    if (historicalCandles.length >= _this.period) {
                        return (historicalCandles.slice(historicalCandles.length - _this.period + 1).map(candle => candle[_this.target]).reduce((vs, v) => vs! + v!)! + candle[_this.target]!) / _this.period
                    }
                    return -1
                }; break;
            case MovingAvaragesTypes.Exponential:
                _this.formule = (candle: Candle, historicalCandles: Candle[]) => {
                    //TODO Test if any 'candle' hasn't 'target' property. 
                    if (historicalCandles.length > _this.period) {
                        return candle[_this.target]! * (2 / (_this.period + 1)) + (this.valueArray.length ? this.valueArray[this.valueArray.length - 1] : historicalCandles[historicalCandles.length - 1][_this.target]!) * (1 - (2 / (_this.period + 1)))
                    }
                    return -1
                }; break;
            case MovingAvaragesTypes.Smoothed: break;
            case MovingAvaragesTypes.LinearWeighted: break;
        }
        super(<IndicatorConfig>_this)
    }
}