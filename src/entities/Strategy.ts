import ClosePositionReason from "../enums/ClosePositionReason";
import TimeFrame from "../enums/TimeFrames";
import { TradingDirections } from "../enums/TradingDirections";
import Candle from "../interfaces/Candle";
import strategyConfig from "../interfaces/StrategyConfig";
import TimedCandles from "../interfaces/TimedCandles";
import Indicator from "./Indicator";
import Logger from "./Logger";
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
    }

    /** Loads historical values of indicators. Then start listening to websocket if any */
    initializeStrategy() {
        return new Promise((resolve, reject) => {
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
                        if (this.founds[0] < this.minimumSize) {
                            this.saveIndicators()
                            this.logger.logFinalResult(true);
                        }
                        this.actualCandle = candle;
                        this.updateIndicators();
                        this.updatePositions();
                        this.checkSignals();
                        this.historicalCandles[0].candles.push(candle);
                    })
                    //End of simulation
                    this.saveIndicators()
                    this.logger.logFinalResult(false);
                    resolve('Simulación Finalizada')

                    //SAVE SIGNAL VALUES
                    // this.signals.forEach((signal, i) => {
                    //     let fs = require('fs')
                    //     fs.writeFileSync('TMP signal ' + i, JSON.stringify(signal.test))
                    // })
                }

            } else {
                reject('Must give an url or candles')
            }
        })
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
        let closeShortSignalStates = this.signals.map(signal => signal.direction === TradingDirections.CloseShort ? signal.getState() : undefined).filter(el => el != undefined)
        let closeLongSignalStates = this.signals.map(signal => signal.direction === TradingDirections.CloseLong ? signal.getState() : undefined).filter(el => el != undefined)
        //Si todas las señales Short están en true y no hay posiciones abiertas en Short
        if (!shortSignalStates.includes(false) && !this.openPositions.short.length) {
            //Calcula el margin de la posicion
            let margin = this.founds[0] * (this.risk || 1)

            //Agrega una nueva posicion al array de posiciones abiertas
            this.openPositions.short.push(new Position({
                id: this.openPositions.short.length,
                margin: this.founds[0] * (this.risk || 1),
                leverage: this.leverage,
                direction: TradingDirections.Short,
                entryPrice: this.actualCandle.close!,
                entryTime: this.actualCandle.closeTime,
                stopLoss: this.stopLoss,
                takeProfit: this.takeProfit,
                initialFounds: this.founds[0],
            }))

            //Resta el margin a los fondos totales
            this.founds.unshift(this.founds[0] - margin);
            this.founds.splice(1);

        }
        //Si hay señal de cerrar shorts y tengo shorts abiertos
        if (!closeShortSignalStates.includes(false) && this.openPositions.short.length) {
            //Cierro las posiciones
            this.openPositions.short.forEach(pos => { if (pos.open) this.logger.addResult(pos!.close(this.actualCandle.close!, this.actualCandle.closeTime!, this.founds, ClosePositionReason.Signal)) })
            //Borro las iposiciones cerradas del array
            this.openPositions.short = this.openPositions.short.filter(pos => pos.open)
        }
        //Si todas las señales Long están en true y no hay posiciones abiertas en Long
        if (!longSignalStates.includes(false) && !this.openPositions.long.length) {
            //Calcula el margin de la posicion
            let margin = this.founds[0] * (this.risk || 1)
            //Agrega una nueva posicion al array de posiciones abiertas
            this.openPositions.long.push(new Position({
                id: this.openPositions.long.length,
                margin: margin,
                leverage: this.leverage,
                direction: TradingDirections.Long,
                entryPrice: this.actualCandle.close!,
                entryTime: this.actualCandle.closeTime,
                stopLoss: this.stopLoss,
                takeProfit: this.takeProfit,
                initialFounds: this.founds[0],
            }))
            //Resta el margin a los fondos totales
            this.founds.unshift(this.founds[0] - margin);
            this.founds.splice(1);

        }
        //Si alguna señal está en false y tengo posicinoes abiertas
        if (!closeLongSignalStates.includes(false) && this.openPositions.short.length) {
            //Cierro las posiciones
            this.openPositions.long.forEach(pos => { if (pos.open) this.logger.addResult(pos!.close(this.actualCandle.close!, this.actualCandle.closeTime!, this.founds, ClosePositionReason.Signal)) })
            //Borro las posiciones cerradas del array
            this.openPositions.long = this.openPositions.long.filter(pos => pos.open)
        }

    }

    updatePositions() {
        this.openPositions.short.concat(this.openPositions.long).forEach(position => {
            let closing = position.getCrossedLimitPrice(this.actualCandle.low, this.actualCandle.high)
            if (closing![0]) this.logger.addResult(position.close(closing[0], this.actualCandle.closeTime!, this.founds, closing[1]!))
        })
        //Borro las posiciones cerradas del array
        this.openPositions.long = this.openPositions.long.filter(pos => pos.open)
    }

    //TEMPORALY
    saveIndicators() {
        this.indicators.forEach(indicator => {
            let fs = require('fs');
            fs.writeFileSync(__dirname + '/../../Testing/Indicators/TMP ' + (indicator.tag || 'indicator' + indicator.id), JSON.stringify(indicator.valueArray).replace('[', '').replace(']', ''));
        })
    }
}
export default Strategy