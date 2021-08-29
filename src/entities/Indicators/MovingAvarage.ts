import MovingAvaragesTypes from "../../enums/MovingAvaragesTypes";
import Candle from "../../interfaces/Candle";
import IndicatorConfig from "../../interfaces/IndicatorConfig";
import MovingAvaragesConfig from "../../interfaces/Indicators/MovingAvaragesConfig";
import Indicator from "../Indicator";
import Helpers from "../../Helpers";
export default class MovingAvarage extends Indicator {
    constructor(config: MovingAvaragesConfig) {
        let _this: MovingAvaragesConfig = <MovingAvaragesConfig>{};
        Object.assign(_this, config);

        //Default Values
        _this.period = _this.period || 100
        _this.source = _this.source || 'close'

        switch (_this.type) {
            case MovingAvaragesTypes.Simple:
                _this.formule = (candle: Candle, historicalCandles: Candle[]) => {
                    //TODO Test if any 'candle' hasn't 'source' property. 
                    return Helpers.formatFloat((historicalCandles.slice(historicalCandles.length - _this.period! + 1).map(candle => candle[_this.source!]).reduce((vs, v) => vs! + v!)! + candle[_this.source!]!) / _this.period!)
                }; break;
            case MovingAvaragesTypes.Exponential:
                _this.formule = (candle: Candle, historicalCandles: Candle[]) => {
                    //TODO Test if any 'candle' hasn't 'source' property. 
                    return Helpers.formatFloat(candle[_this.source!]! * (2 / (_this.period! + 1)) + (this.valueArray.length ? this.valueArray[this.valueArray.length - 1] : historicalCandles[historicalCandles.length - 1][_this.source!]!) * (1 - (2 / (_this.period! + 1))))
                }; break;
            case MovingAvaragesTypes.Smoothed: break;
            case MovingAvaragesTypes.LinearWeighted: break;
        }
        super(<IndicatorConfig>_this)
    }
}