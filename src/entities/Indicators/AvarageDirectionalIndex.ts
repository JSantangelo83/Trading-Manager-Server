import AvarageDirectionalIndexConfig from "../../interfaces/Indicators/AvarageDirectionalIndexConfig";
import Candle from "../../interfaces/Candle";
import Indicator from "../Indicator";
import Helpers from "../../Helpers";
import { Console } from "console";

export default class AvarageDirectionalIndex extends Indicator {
    lastATR: number
    lastApDM: number
    lastAnDM: number
    lastDX!: number[]
    constructor(config: AvarageDirectionalIndexConfig) {
        let _this = <AvarageDirectionalIndexConfig>{}
        Object.assign(_this, config);

        //Default values
        _this.period = _this.period || 14
        _this.formule = (candle: Candle, historicalCandles: Candle[]) => {
            let ATR: number = 0;
            let ApDM: number = 0;
            let AnDM: number = 0;

            let historicalPeriodPosition = historicalCandles.length - _this.period!

            //Calculates Avarage +DM,-DM and TR of the period
            historicalCandles.slice(historicalPeriodPosition).forEach((hCandle: Candle, i: number) => {
                if (i == 0) return
                ATR += this.calculateTR(hCandle, historicalCandles[historicalPeriodPosition + i - 1])
                ApDM += this.calculateDM(hCandle, historicalCandles[historicalPeriodPosition + i - 1], true)
                AnDM += this.calculateDM(hCandle, historicalCandles[historicalPeriodPosition + i - 1], false)
            })

            //Adds today's Candle to the calculation, and takes the avarage
            ATR = Helpers.formatFloat((ATR + this.calculateTR(candle, historicalCandles[historicalCandles.length - 1])) / _this.period!)
            ApDM = Helpers.formatFloat((ApDM + this.calculateDM(candle, historicalCandles[historicalCandles.length - 1], true)) / _this.period!)
            AnDM = Helpers.formatFloat((AnDM + this.calculateDM(candle, historicalCandles[historicalCandles.length - 1], false)) / _this.period!)

            //Calculates ATR,ApDM and AnDM by using Wilder's smooth technique
            this.lastATR = Helpers.formatFloat(this.lastATR ? Helpers.calculateWildersAvarage(this.lastATR, ATR, _this.period!) : ATR)
            this.lastApDM = Helpers.formatFloat(this.lastApDM ? Helpers.calculateWildersAvarage(this.lastApDM, ApDM, _this.period!) : ApDM)
            this.lastAnDM = Helpers.formatFloat(this.lastAnDM ? Helpers.calculateWildersAvarage(this.lastAnDM, AnDM, _this.period!) : AnDM)
            //Calculates +DI and -DI
            let pDI = Helpers.formatFloat((this.lastApDM / this.lastATR) * 100, 2)
            let nDI = Helpers.formatFloat((this.lastAnDM / this.lastATR) * 100, 2)

            //Calculates DX
            let diffDI = Math.abs(pDI - nDI)
            let sumDI = Math.abs(pDI + nDI)
            let DX = Helpers.formatFloat(100 * (diffDI / sumDI))
            //Ads new DXValue to DX list or Creates it if first time
            this.lastDX = this.lastDX || []
            this.lastDX.push(DX)
            //Deletes the innecesary data
            this.lastDX = this.lastDX.slice(-_this.period!)

            let newValue: number = 0

            //Calculates the new value by using DX Avarage
            if (this.valueArray.filter(v => v != -1).length <= _this.period!) { newValue = DX }
            //Calculates the new value by using Simple Avarage when is enough data
            else if (this.valueArray.filter(v => v != -1).length == _this.period! + 1) { newValue = Helpers.formatFloat(this.lastDX.reduce((vs, v) => v + vs) / _this.period!) }
            //Calculates the new value by using Wilder's Exponential Avarage when is enough data
            else if (this.valueArray.filter(v => v != -1).length > _this.period! + 1) { newValue = Helpers.calculateWildersAvarage(this.lastDX[this.lastDX.length - 1], DX, _this.period!) }

            return Helpers.formatFloat(newValue)
        }
        super(_this)

        //Initialize
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
            return (tCandle.high! - yCandle.high!) > (yCandle.low! - tCandle.low!) ? Math.max(0, Helpers.formatFloat((tCandle.high! - yCandle.high!))) : 0
        } else {
            return (yCandle.low! - tCandle.low!) > (tCandle.high! - yCandle.high!) ? Math.max(0, Helpers.formatFloat((yCandle.low! - tCandle.low!))) : 0
        }
    }

}