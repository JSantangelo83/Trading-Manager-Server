import TimeFrame from "../enums/TimeFrames";
import { TradingDirections } from "../enums/TradingDirections";
import Candle from "../interfaces/Candle";
import strategyConfig from "../interfaces/StrategyConfig";
import TimedCandles from "../interfaces/TimedCandles";
import Indicator from "./Indicator";
import Signal from "./Signal";

export default class Strategy {
    signals: Signal[]
    pairs: string[] | undefined
    url: string | undefined
    timedCandles: TimedCandles[] | undefined
    indicators: Indicator[]
    startTime: number
    timeFrame: TimeFrame

    actualCandle: Candle
    historicalCandles: TimedCandles[];
    constructor(config: strategyConfig) {
        this.signals = config.signals
        this.pairs = config.pairs
        this.url = config.url
        this.timedCandles = config.timedCandles
        this.startTime = config.startTime || 200
        this.timeFrame = config.timeFrame
        /** Indicators contained of strategy (obtained from Signals)*/
        this.indicators = []
        /** Last checked candle */
        this.actualCandle = <Candle>{};
        /** Candles until `actualCandle` */
        this.historicalCandles = <TimedCandles[]>[];
        /** Loading indicators from Signals */
        this.signals.forEach(signal => {
            signal.indicators.forEach(indicator => {
                this.indicators.push(indicator)
            })
        })

        this.initializeStrategy()
    }

    /** Loads historical values of indicators. Then start listening to websocket if any */
    initializeStrategy() {
        if (this.url) {
            //TODO handle urls
        } else if (this.timedCandles && this.startTime) {
            if (Object.keys(this.timedCandles).length > 1) {
                //Handle Multi-TimeFrames
            } else {
                this.historicalCandles = [{ timeFrame: this.timedCandles[0].timeFrame, candles: this.timedCandles[0].candles.filter(c => c.closeTime! < this.startTime) }];
                let futureCandles = [{ timeFrame: this.timedCandles[0].timeFrame, candles: this.timedCandles[0].candles.filter(c => c.closeTime! < this.startTime) }];
                this.indicators.forEach(indicator => indicator.calculateHistory(this.historicalCandles[0].candles));
                futureCandles[0].candles.forEach(candle => {
                    this.actualCandle = candle;
                    this.updateIndicators();
                    this.checkSignals();
                    this.historicalCandles[0].candles.push(candle);
                })
            }

        } else {
            throw new Error('Must give an url or candles')
        }
    }

    /** Updates all the indicator's values */
    updateIndicators() {
        this.indicators.forEach(indicator => indicator.calculateNext(this.actualCandle, this.historicalCandles.filter(tc => tc.timeFrame == indicator.timeFrame)[0].candles))
    }

    /** Checks the state of the signals and triggers operations */
    checkSignals() {
        let shortSignalStates = this.signals.map(signal => signal.direction == TradingDirections.Short ? signal.getState() : undefined).filter(el => el != undefined)
        let longSignalStates = this.signals.map(signal => signal.direction == TradingDirections.Long ? signal.getState() : undefined).filter(el => el != undefined)
        if (!shortSignalStates.includes(false)) { this.makeShort() }
        if (!longSignalStates.includes(false)) { this.makeLong() }
    }
    /** Sends a short operation */
    makeShort = () => {
        console.log('putting Short on candle: ', this.actualCandle)
        console.log('Time: ', this.actualCandle.closeTime)
    }

    /** Sends a long operation */
    makeLong = () => {
        console.log('putting Long on candle: ', this.actualCandle)
        console.log('Time: ', this.actualCandle.closeTime)
    }
}