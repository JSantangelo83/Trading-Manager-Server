import { TradingDirections } from "../enums/TradingDirections";
import Helpers from "../Helpers";
import PositionConfig from "../interfaces/PositionConfig";

interface Position extends PositionConfig { }
class Position {
    constructor(config: PositionConfig) {
        Object.assign(this, config)

        //Error Handling
        if (!this.entryPrice || !this.entryTime) { throw new Error('Must indicate Entry Price and Entry Time for testing') }

        if (this.lever) { this.liquidationPrice = this.entryPrice + ((((100 / this.lever) * this.entryPrice) / 100) * (this.direction == TradingDirections.Short ? 1 : -1)) }
    }

    close(closePrice: number, closeTime: number, founds: number[], liquidated: boolean = false) {
        /** Porcentaje (win or lose) of the trade */
        let tradePercentage: number = 0
        if (this.direction == TradingDirections.Short) { tradePercentage = Helpers.formatFloat((100 - ((closePrice * 100) / this.entryPrice)) * (this.lever || 1)) }
        if (this.direction == TradingDirections.Long) { tradePercentage = Helpers.formatFloat((((closePrice * 100) / this.entryPrice) - 100) * (this.lever || 1)) }

        /** Duration of the trading (hours) */
        let tradeDuration = ((closeTime - this.entryTime!) / 3600000)

        /** Result (true for Profit, false for Loss) */
        let result = tradePercentage > 0
        /** Profit or loss of the trade */
        let profit = Helpers.formatFloat((tradePercentage * 100) / this.margin)
        //Es una asignación por referencia, uso array porque js los pasa siempre byref
        founds.unshift(liquidated ? 0 : founds[0] + profit)
        founds.splice(1)

        Helpers.log(`${result ? 'Good' : 'Bad'} ${TradingDirections[this.direction].toString()} ${tradePercentage}% | ${result ? 'Win' : 'Loss'} on account: ${profit} | Duration: ${tradeDuration}h | founds: ${Helpers.formatFloat(founds[0])} (e: ${this.entryPrice} s:${closePrice}) ${liquidated ? '| LIQUIDATED' : ''}`)
    }

    checkLiquidation(priceLow: number = 0, priceHigh: number = 0) {
        if (this.direction == TradingDirections.Short) { return priceHigh > this.liquidationPrice! }
        if (this.direction == TradingDirections.Long) { return priceLow < this.liquidationPrice! }
        return undefined
    }
}

export default Position;