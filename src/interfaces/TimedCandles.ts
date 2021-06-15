import TimeFrame from "../enums/TimeFrames";
import Candle from "./Candle";

export default interface TimedCandles {
    timeFrame: TimeFrame,
    candles: Candle[];
}