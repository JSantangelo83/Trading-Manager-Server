import { TradingDirections } from "../enums/TradingDirections";
import Entity from "./Entity";
export default interface PositionConfig extends Entity {
    /** The margin of the position */
    margin: number,
    /** The Stop Loss level */
    stopLoss?: number,
    /** The Take Profit level */
    takeProfit?: number,
    /** The Leverage of the position (if not Spot) */
    lever?: number,
    /** The Liquidation price of the position(if not Spot) */
    liquidationPrice?: number,
    /** The direction of the position */
    direction: TradingDirections,
}