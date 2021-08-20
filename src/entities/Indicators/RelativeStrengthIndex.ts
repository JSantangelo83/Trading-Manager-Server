import Indicator from "../Indicator";
import Candle from "../../interfaces/Candle";
import IndicatorConfig from "../../interfaces/IndicatorConfig";
import RelativeStrengthIndexConfig from "../../interfaces/Indicators/RelativeStrengthIndexConfig";
import Helpers from "../../Helpers";

export default class RelativeStrengthIndex extends Indicator {
    lastAvarageLoss: number
    lastAvarageWin: number
    lastRS: number
    constructor(config: RelativeStrengthIndexConfig) {
        let _this: RelativeStrengthIndexConfig = <RelativeStrengthIndexConfig>{};
        Object.assign(_this, config);

        //Default values
        _this.period = _this.period || 14
        _this.source = _this.source || 'close'

        _this.formule = (candle: Candle, historicalCandles: Candle[]) => {
            let avarageLoss: number = 0
            let avarageWin: number = 0

            //It is used to slice the array
            let historicalPeriodPosition = historicalCandles.length - _this.period!

            //Calculates AvarageLoss and AvarageWin of the period
            historicalCandles.slice(historicalPeriodPosition).forEach((hCandle: Candle, i: number) => {
                if (i == 0) return
                avarageLoss += hCandle.close! < historicalCandles[historicalPeriodPosition + i - 1].close! ? historicalCandles[historicalPeriodPosition + i - 1].close! - hCandle.close! : 0
                avarageWin += hCandle.close! > historicalCandles[historicalPeriodPosition + i - 1].close! ? hCandle.close! - historicalCandles[historicalPeriodPosition + i - 1].close! : 0
            })
            //Adds today's Candle to the calculation, and takes the avarage
            avarageLoss = Helpers.formatFloat((avarageLoss + (candle.close! < historicalCandles[historicalCandles.length - 1].close! ? historicalCandles[historicalCandles.length - 1].close! - candle.close! : 0)) / _this.period!)
            avarageWin = Helpers.formatFloat((avarageWin + (candle.close! > historicalCandles[historicalCandles.length - 1].close! ? candle.close! - historicalCandles[historicalCandles.length - 1].close! : 0)) / _this.period!)

            //Calculates RS
            let RS = (this.lastAvarageLoss && this.lastAvarageWin) ? (this.lastAvarageWin / this.lastAvarageLoss) : (avarageWin / avarageLoss)

            //Calculates AvarageLoss, AvarageWin and RS by using Wilder's smooth technique
            this.lastAvarageLoss = this.lastAvarageLoss ? Helpers.calculateWildersAvarage(this.lastAvarageLoss, avarageLoss, _this.period!) : avarageLoss
            this.lastAvarageWin = this.lastAvarageWin ? Helpers.calculateWildersAvarage(this.lastAvarageWin, avarageWin, _this.period!) : avarageWin
            this.lastRS = this.lastRS ? Helpers.calculateWildersAvarage(this.lastRS, RS, _this.period!) : RS

            //Calculates RSI
            let RSI = Helpers.formatFloat(100 - (100 / (this.lastRS + 1)))
            // console.log(RSI)
            return RSI
        };
        super(<IndicatorConfig>_this)

        //Initialize
        this.lastAvarageLoss = 0
        this.lastAvarageWin = 0
        this.lastRS = 0
    }
}
