import TimeFrame from "../enums/TimeFrames";
import { TradingDirections } from "../enums/TradingDirections";
import Candle from "../interfaces/Candle";
import strategyConfig from "../interfaces/StrategyConfig";
import TimedCandles from "../interfaces/TimedCandles";
import Indicator from "./Indicator";
import Position from "./Position";

interface Strategy extends strategyConfig { }
class Strategy {
    //Runtime Properties

    /** Indicators contained of strategy (obtained from Signals)*/
    indicators: Indicator[] = []
    /** Last checked candle */
    actualCandle: Candle = <Candle>{};
    /** Candles until `actualCandle` */
    historicalCandles: TimedCandles[] = <TimedCandles[]>[];
    /** Current opened positions */
    openPositions: Position[] = <Position[]>[];

    constructor(config: strategyConfig) {
        Object.assign(this, config)

        /** Loading indicators from Signals */
        this.signals.forEach(signal => {
            signal.indicators.forEach(indicator => {
                //Looking for duplicated Indicators
                if (!this.indicators.map(indicator => indicator.id).includes(indicator.id)) {
                    this.indicators.push(indicator)
                };
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
                //TODO Handle Multi-TimeFrames
            } else {
                this.historicalCandles = [{ timeFrame: this.timedCandles[0].timeFrame, candles: this.timedCandles[0].candles.filter(c => c.closeTime! <= this.startTime!) }];
                let futureCandles = [{ timeFrame: this.timedCandles[0].timeFrame, candles: this.timedCandles[0].candles.filter(c => c.closeTime! > this.startTime!) }];
                this.indicators.forEach(indicator => indicator.calculateHistory(this.historicalCandles[0].candles));
                futureCandles[0].candles.forEach(candle => {
                    this.actualCandle = candle;
                    this.updateIndicators();
                    this.checkSignals();
                    this.historicalCandles[0].candles.push(candle);
                })
                //SAVE INDICATOR VALUES
                this.indicators.forEach(indicator => {
                    let fs = require('fs');
                    fs.writeFileSync(__dirname + '/../../Testing/TMP ' + (indicator.tag || 'indicator' + indicator.id), JSON.stringify(indicator.valueArray).replace('[', '').replace(']', ''));
                })

                //SAVE SIGNAL VALUES
                // this.signals.forEach((signal, i) => {
                //     let fs = require('fs')
                //     fs.writeFileSync('TMP signal ' + i, JSON.stringify(signal.test))
                // })
            }

        } else {
            throw new Error('Must give an url or candles')
        }
    }

    /** Updates all the indicator's values */
    updateIndicators() {
        this.indicators.forEach(indicator => {
            indicator.calculateNext(this.actualCandle, this.historicalCandles.filter(tc => tc.timeFrame == indicator.timeFrame)[0].candles)
        })
    }

    /** Checks the state of the signals and triggers Positions */
    checkSignals() {
        let shortSignalStates = this.signals.map(signal => signal.direction === TradingDirections.Short ? signal.getState() : undefined).filter(el => el != undefined)
        let longSignalStates = this.signals.map(signal => signal.direction === TradingDirections.Long ? signal.getState() : undefined).filter(el => el != undefined)
        if ((!this.openPositions.length || this.openPositions[this.openPositions.length - 1].direction != TradingDirections.Short) && !shortSignalStates.includes(false)) {
            this.openPositions.push(new Position({
                id: this.openPositions.length,
                margin: 0,
                direction: TradingDirections.Short,
                entryPrice: this.actualCandle.close!,
                entryTime: this.actualCandle.closeTime,
            }))
        }
        if ((!this.openPositions.length || this.openPositions[this.openPositions.length - 1].direction != TradingDirections.Long) && !longSignalStates.includes(false)) {
            this.openPositions.push(new Position({
                id: this.openPositions.length,
                margin: 0,
                direction: TradingDirections.Long,
                entryPrice: this.actualCandle.close!,
                entryTime: this.actualCandle.closeTime,
            }))

        }
    }

}
export default Strategy