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
    leverage?: number,
    /** The Liquidation price of the position(if not Spot) */
    liquidationPrice?: number,
    /** The direction of the position */
    direction: TradingDirections,
    /** The Entry Price of the position */
    entryPrice: number,
    /** Entry Time of the position */
    entryTime?: number,
    /** Founds at the opening time*/
    initialFounds: number,
}