import TimeFrame from "../enums/TimeFrames";
import { TradingDirections } from "../enums/TradingDirections";
import Candle from "../interfaces/Candle";
import strategyConfig from "../interfaces/StrategyConfig";
import TimedCandles from "../interfaces/TimedCandles";
import Indicator from "./Indicator";
import Position from "./Position";

interface OpenPositions {
    short: Position[],
    long: Position[]
}

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
    openPositions: OpenPositions = { short: [], long: [] }

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
                    if (this.founds[0] < 0) { throw '---------------------------\n You were Liquidated, end of game :c \n ---------------------------' }
                    this.actualCandle = candle;
                    this.updateIndicators();
                    this.checkSignals();
                    this.updatePositions();
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
        //Agarro un array de estados por cada direccion de trade
        let shortSignalStates = this.signals.map(signal => signal.direction === TradingDirections.Short ? signal.getState() : undefined).filter(el => el != undefined)
        let longSignalStates = this.signals.map(signal => signal.direction === TradingDirections.Long ? signal.getState() : undefined).filter(el => el != undefined)
        //Si todas las señales Short están en true y no hay posiciones abiertas en Short
        if (!shortSignalStates.includes(false) && !this.openPositions.short.length) {
            //Agrega una nueva posicion al array de posiciones abiertas
            this.openPositions.short.push(new Position({
                id: this.openPositions.short.length,
                margin: this.founds[0] * (this.risk || 1),
                lever: 10,
                direction: TradingDirections.Short,
                entryPrice: this.actualCandle.close!,
                entryTime: this.actualCandle.closeTime,
            }))

            //Si alguna señal está en false y tengo posiciones abiertas
        } else if (shortSignalStates.includes(false) && this.openPositions.short.length) {
            //Cierro las posiciones
            this.openPositions.short.forEach(pos => pos!.close(this.actualCandle.close!, this.actualCandle.closeTime!, this.founds))
            //Vacio todas las posiciones
            this.openPositions.short = <Position[]>[]
        }
        //Si todas las señales Long están en true y no hay posiciones abiertas en Long
        if (!longSignalStates.includes(false) && !this.openPositions.long.length) {
            //Agrega una nueva posicion al array de posiciones abiertas
            this.openPositions.long.push(new Position({
                id: this.openPositions.long.length,
                margin: this.founds[0] * (this.risk || 1),
                lever: 10,
                direction: TradingDirections.Long,
                entryPrice: this.actualCandle.close!,
                entryTime: this.actualCandle.closeTime,
            }))

            //Si alguna señal está en false y tengo posicinoes abiertas
        } else if (longSignalStates.includes(false) && this.openPositions.long.length) {
            //Cierro las posiciones
            this.openPositions.long.forEach(pos => pos!.close(this.actualCandle.close!, this.actualCandle.closeTime!, this.founds))
            //Vacio todas las posiciones
            this.openPositions.long = <Position[]>[]
        }

    }

    updatePositions() {
        this.openPositions.short.concat(this.openPositions.long).forEach(position => {
            if (position.checkLimits(this.actualCandle.low, this.actualCandle.high)) {
                position.close(position.liquidationPrice!, this.actualCandle.closeTime!, this.founds, true)
            }
        })
    }
}
export default Strategy