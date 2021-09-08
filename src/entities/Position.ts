import ClosePositionReason from "../enums/ClosePositionReason";
import { TradingDirections } from "../enums/TradingDirections";
import Helpers from "../Helpers";
import PositionConfig from "../interfaces/PositionConfig";
import PositionResult from "../interfaces/PositionResult";

interface Position extends PositionConfig { }
class Position {
    /* If true, it means that the position is open*/
    open: boolean
    /** Price where the Stop Loss is placed (if any)  */
    stopLossPrice: number
    /** Price where the Take Profit is placed (if any)  */
    takeProfitPrice: number

    constructor(config: PositionConfig) {
        Object.assign(this, config)
        //Default Values
        this.open = true
        this.stopLossPrice = 0
        this.takeProfitPrice = 0

        if (this.stopLoss && this.direction == TradingDirections.Long) this.stopLossPrice = this.entryPrice - ((this.stopLoss * this.entryPrice) / 100)
        if (this.takeProfit && this.direction == TradingDirections.Long) this.takeProfitPrice = this.entryPrice + ((this.takeProfit * this.entryPrice) / 100)
        if (this.stopLoss && this.direction == TradingDirections.Short) this.stopLossPrice = this.entryPrice + ((this.stopLoss * this.entryPrice) / 100)
        if (this.takeProfit && this.direction == TradingDirections.Short) this.takeProfitPrice = this.entryPrice - ((this.takeProfit * this.entryPrice) / 100)

        //Error Handling
        if (!this.entryPrice || !this.entryTime) { throw new Error('Must indicate Entry Price and Entry Time for testing') }
        if (this.leverage) { this.liquidationPrice = this.entryPrice + ((((100 / this.leverage) * this.entryPrice) / 100) * (this.direction == TradingDirections.Short ? 1 : -1)) }

    }

    close(closePrice: number, closeTime: number, founds: number[], reason: ClosePositionReason): PositionResult {
        this.open = false;
        let ret = {} as PositionResult
        ret.initialFounds = this.initialFounds
        if (this.direction == TradingDirections.Short) { ret.percentage = Helpers.formatFloat(100 - ((closePrice * 100) / this.entryPrice)) }
        if (this.direction == TradingDirections.Long) { ret.percentage = Helpers.formatFloat(((closePrice * 100) / this.entryPrice) - 100) }
        ret.closeTime = closeTime
        ret.entryTime = this.entryTime
        ret.closePrice = closePrice
        ret.duration = Helpers.formatFloat(((ret.closeTime - this.entryTime!) / 3600000))
        ret.result = ret.percentage > 0
        ret.profit = Helpers.formatFloat(((ret.percentage * this.margin * (this.leverage || 1)) / 100))
        //Asignación por referencia, uso array porque js los pasa siempre byref
        founds.unshift(founds[0] + ret.profit + this.margin)
        founds.splice(1)
        ret.finalFounds = founds[0]
        ret.reason = reason
        ret.direction = this.direction

        return { ...this, ...ret }
    }

    getCrossedLimitPrice(priceLow: number = 0, priceHigh: number = 0): [number, ClosePositionReason] {
        if (this.direction == TradingDirections.Short) {
            if (priceHigh > this.liquidationPrice!) return [this.liquidationPrice!, ClosePositionReason.Liquidated]
            if ((priceHigh > this.stopLossPrice!) && this.stopLossPrice) return [this.stopLossPrice, ClosePositionReason.StopLoss]
            if ((priceLow < this.takeProfitPrice!) && this.takeProfitPrice) return [this.takeProfitPrice, ClosePositionReason.TakeProfit]
        }
        if (this.direction == TradingDirections.Long) {
            if (priceLow < this.liquidationPrice!) return [this.liquidationPrice!, ClosePositionReason.Liquidated]
            if ((priceLow < this.stopLossPrice!) && this.stopLossPrice) return [this.stopLossPrice, ClosePositionReason.StopLoss]
            if ((priceHigh > this.takeProfitPrice!) && this.takeProfitPrice) return [this.takeProfitPrice, ClosePositionReason.TakeProfit]
        }
        return [0, undefined!]
    }
}

export default Position;