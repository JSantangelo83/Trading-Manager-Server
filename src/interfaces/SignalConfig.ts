import Indicator from "../entities/Indicator";
import { SignalTypes } from "../enums/SignalTypes";
import { TradingDirections } from "../enums/TradingDirections";
/*
* Config interface for Signals
*/
export default interface SignalConfig {
    /*
    * Type of the Signal
    */
    type: SignalTypes,
    /*
    * Indicator/s needed to produce the signal
    */
    indicators: Indicator[],
    /**
     * Direction of the trade
     */
    direction: TradingDirections
    /*
    * Duration of the signal, default forever
    */
    duration?: number,
    /**
     * Margin of the signal
     */
    margin?: number,
}

