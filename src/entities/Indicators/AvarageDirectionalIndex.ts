import AvarageDirectionalIndexConfig from "../../interfaces/Indicators/AvarageDirectionalIndexConfig";
import Candle from "../../interfaces/Candle";
import Indicator from "../Indicator";
import Helpers from "../../Helpers";
import { Console } from "console";

export default class AvarageDirectionalIndex extends Indicator {
    lastATR: number
    lastApDM: number
    lastAnDM: number
    constructor(config: AvarageDirectionalIndexConfig) {
        let _this = <AvarageDirectionalIndexConfig>{}
        Object.assign(_this, config);

        //Default values
        _this.period = _this.period || 14

        _this.formule = (candle: Candle, historicalCandles: Candle[]) => {
            let ATR: number = 0;
            let ApDM: number = 0;
            let AnDM: number = 0;
            //Calculates Avarage +DM,-DM and TR of the period
            historicalCandles.slice(historicalCandles.length - _this.period!).forEach((hCandle, i: number) => {
                if (i == 0) return
                ATR += this.calculateTR(hCandle, historicalCandles[i - 1])
                ApDM += this.calculateDM(hCandle, historicalCandles[i - 1], true)
                AnDM += this.calculateDM(hCandle, historicalCandles[i - 1], false)
            })

            //Adds today's Candle to the calculation, and takes the avarage
            ATR = (ATR + this.calculateTR(candle, historicalCandles[historicalCandles.length - 1])) / _this.period!
            ApDM = (ApDM + this.calculateDM(candle, historicalCandles[historicalCandles.length - 1], true)) / _this.period!
            AnDM = (AnDM + this.calculateDM(candle, historicalCandles[historicalCandles.length - 1], false)) / _this.period!

            //Calculates ATR,ApDM and AnDM by using Wilder's Exponential Avarage
            this.lastATR = this.lastATR ? this.calculateWildersAvarage(this.lastATR, ATR) : ATR
            this.lastApDM = this.lastApDM ? this.calculateWildersAvarage(this.lastApDM, ApDM) : ApDM
            this.lastAnDM = this.lastAnDM ? this.calculateWildersAvarage(this.lastAnDM, AnDM) : AnDM

            //Calculates +DI and -DI
            let pDI = Helpers.formatFloat((this.lastApDM / this.lastATR) * 100, 2)
            let nDI = Helpers.formatFloat((this.lastAnDM / this.lastATR) * 100, 2)

            //Calculates DX
            let DX = Helpers.formatFloat(Math.abs((pDI - nDI) / (pDI + nDI)))
            console.log(DX)
            let newValue: number = 0
            //Calculates the new value by using DX Avarage
            if (this.valueArray.length <= _this.period!) { newValue = DX }
            //Calculates the new value by using Simple Avarage when is enough data
            else if (this.valueArray.length == _this.period! + 1) { newValue = Helpers.formatFloat(this.valueArray.filter(v => v != -1).reduce((vs, v) => v + vs) / _this.period!) }
            //Calculates the new value by using Wilder's Exponential Avarage when is enough data
            else if (this.valueArray.length > _this.period! + 1) { newValue = this.calculateWildersAvarage(this.valueArray[this.valueArray.length - 1], DX) }

            return newValue
        }
        super(_this)
        this.lastATR = 0;
        this.lastAnDM = 0;
        this.lastApDM = 0;
    }
    /** Calculates te True Range 
     * @param tCandle Today's Candle
     * @param yCandle Yesterday's Candle
    */
    private calculateTR(tCandle: Candle, yCandle: Candle): number {
        let d1 = Helpers.formatFloat(tCandle.high! - tCandle.low!, 4)
        let d2 = Helpers.formatFloat(Math.abs(tCandle.high! - yCandle.close!), 4)
        let d3 = Helpers.formatFloat(Math.abs(tCandle.low! - yCandle.close!), 4)
        return Math.max(d1, d2, d3)
    }

    /** Calculates the +DM and -DM
     * @param tCandle Today's Candle
     * @param yCandle Yesterday's Candle
     * @param type Indicates the DM type (true for +DM, false for -DM)
     */
    private calculateDM(tCandle: Candle, yCandle: Candle, type: boolean): number {
        if (type) {
            return (tCandle.high! - yCandle.high!) > (tCandle.low! - yCandle.low!) ? Helpers.formatFloat((tCandle.high! - yCandle.high!)) : 0
        } else {
            return (yCandle.low! - tCandle.low!) > (tCandle.high! - yCandle.high!) ? Helpers.formatFloat((yCandle.low! - tCandle.low!)) : 0
        }
    }

    // private calculateWildersAvarage(lastValue: number, currentValue: number) {
    //     return Helpers.formatFloat((((this.period! - 1) / this.period!) * lastValue) + (currentValue / this.period!), 4)
    // }
    private calculateWildersAvarage(lastValue: number, currentValue: number) {
        return Helpers.formatFloat(((lastValue * 13) + currentValue) / this.period!)
    }

}