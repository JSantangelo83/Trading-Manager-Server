import { TradingDirections } from "../enums/TradingDirections";
import Helpers from "../Helpers";
import PositionConfig from "../interfaces/PositionConfig";
import PositionResult from "../interfaces/PositionResult";

interface Position extends PositionConfig { }
class Position {
    /*If true, it means that the position is open*/
    open: boolean

    constructor(config: PositionConfig) {
        Object.assign(this, config)
        this.open = true
        //Error Handling
        if (!this.entryPrice || !this.entryTime) { throw new Error('Must indicate Entry Price and Entry Time for testing') }

        if (this.leverage) { this.liquidationPrice = this.entryPrice + ((((100 / this.leverage) * this.entryPrice) / 100) * (this.direction == TradingDirections.Short ? 1 : -1)) }

    }

    close(closePrice: number, closeTime: number, founds: number[], liquidated: boolean = false): PositionResult {
        this.open = false;
        let ret = {} as PositionResult
        ret.initialFounds = this.initialFounds
        if (this.direction == TradingDirections.Short) { ret.percentage = Helpers.formatFloat((100 - ((closePrice * 100) / this.entryPrice)) * (this.leverage || 1)) }
        if (this.direction == TradingDirections.Long) { ret.percentage = Helpers.formatFloat((((closePrice * 100) / this.entryPrice) - 100) * (this.leverage || 1)) }
        ret.closeTime = closeTime
        ret.entryTime = this.entryTime
        ret.duration = Helpers.formatFloat(((ret.closeTime - this.entryTime!) / 3600000))
        ret.result = ret.percentage > 0
        ret.profit = Helpers.formatFloat(((ret.percentage * this.margin) / 100))
        //Asignación por referencia, uso array porque js los pasa siempre byref
        founds.unshift(founds[0] + ret.profit + this.margin)
        founds.splice(1)
        ret.finalFounds = founds[0]
        ret.liquidated = liquidated || ret.finalFounds <= 0
        ret.direction = this.direction

        return ret
    }

    checkLimits(priceLow: number = 0, priceHigh: number = 0) {
        if (this.direction == TradingDirections.Short) { return priceHigh > this.liquidationPrice! }
        if (this.direction == TradingDirections.Long) { return priceLow < this.liquidationPrice! }
        return undefined
    }
}

export default Position;