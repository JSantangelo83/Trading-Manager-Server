import Logger from "../entities/Logger";
import Signal from "../entities/Signal";
import TimeFrame from "../enums/TimeFrames";
import Candle from "./Candle";
import TimedCandles from "./TimedCandles";
/*
* Strategy config interface
*/
export default interface StrategyConfig {
    /*
    * List of signals to check
    */
    signals: Signal[],
    /*
    * List of pairs to watch
    */
    pairs?: string[],
    /**
     * Global time frame for the Strategy
     */
    timeFrame: TimeFrame,
    /*
    * Url of the WebSocket from wich get the candle data
    */
    url?: string,
    /*
    * Hardcoded candles (only for testing)
    */
    timedCandles?: TimedCandles[],
    /** 
     * Starting time of the simulation (only for testing)
     */
    startTime?: number,
    /** Account size */
    founds: number[],
    /** Account risk percentage per trade (default 100%) */
    risk?: number
    /** Leverage of the positions (if any) */
    leverage?: number
    /** The logger of the strategy */
    logger: Logger
    /** Minimum size of account (if less, you cannot open any position) */
    minimumSize: number,
}