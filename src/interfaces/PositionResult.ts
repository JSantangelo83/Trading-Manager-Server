import ClosePositionReason from "../enums/ClosePositionReason";
import { TradingDirections } from "../enums/TradingDirections";
import PositionConfig from "./PositionConfig";

export default interface PositionResult extends PositionConfig {
    /** The duration of the trade (miliseconds) */
    duration: number,
    /** If the trade was Good or Bad */
    result: boolean,
    /** Profit (or loss) taked from the trade */
    profit: number,
    /** Founds that left on the account after the trade was made */
    finalFounds: number,
    /** Close time of the Trade (miliseconds) */
    closeTime: number,
    /** The profit/loss percentage */
    percentage: number,
    /** Reason why the position was closed */
    reason: ClosePositionReason,
}