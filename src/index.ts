import express, { response } from 'express';
import MovingAvarage from './entities/Indicators/MovingAvarage';
import Strategy from './entities/Strategy';
import MovingAvaragesTypes from './enums/MovingAvaragesTypes';
import Signal from './entities/Signal';
import { TradingDirections } from './enums/TradingDirections';
import { SignalTypes } from './enums/SignalTypes';
import TimeFrame from './enums/TimeFrames';
import Helpers from './Helpers';
import Candle from './interfaces/Candle';
import AvarageDirectionalIndex from './entities/Indicators/AvarageDirectionalIndex';
import Line from './entities/Indicators/Line';
import RelativeStrengthIndex from './entities/Indicators/RelativeStrengthIndex';
import axios, { AxiosResponse } from 'axios';
import Logger from './entities/Logger';

const app = express();
const errorHandler = require('errorhandler')
const PORT = 3001;

app.use(express.json())
app.use(express.urlencoded())
app.use(errorHandler({ dumpExceptions: true, showStack: true }));

app.get('/', (req, res) => {
    res.send('test passed')
})

app.post('/test', (req, res) => {
    console.log('POST received, calculating...')
    let apiUrl = 'https://api1.binance.com/api/v3/klines'

    let symbol: string = req.body.symbol
    let interval: keyof typeof TimeFrame = req.body.interval
    let nKlines: number = Number(req.body.nKlines || 0)
    let startCandle: number = Number(req.body.startCandle || 0)
    //Error Handling
    if (!symbol || !interval || !nKlines) res.status(403).send('Must indicate Symbol, Interval and nKlines')
    let klines: Candle[]
    axios.get(`${apiUrl}?symbol=${symbol}&interval=${interval}&limit=${(nKlines < 1000 ? nKlines : 1000)}`).then(res => {
        if (nKlines <= 1000) {
            klines = Helpers.parseBinanceKLines(res.data)

            let fs = require('fs');
            fs.writeFileSync(__dirname + '/../Testing/testingCandles.json', JSON.stringify(klines));

            startSimulation();
        }
        else {
            let lastData = res.data
            let frstTime = res.data[0][6]
            let step = res.data[1][6] - frstTime
            let reqs: Promise<AxiosResponse<any>>[] = []
            while ((nKlines - 1000) > 1000) {
                let endTime = (frstTime - (reqs.length * step * 1000)) - step
                reqs.push(axios.get(`${apiUrl}?symbol=${symbol}&interval=${interval}&endTime=${endTime}&limit=1000`))
                nKlines -= 1000
            }
            let endTime = (frstTime - (reqs.length * step * 1000)) - step
            reqs.push(axios.get(`${apiUrl}?symbol=${symbol}&interval=${interval}&endTime=${endTime}&limit=${nKlines}`))
            let ret: any[] = []
            axios.all(reqs).then(axios.spread((...responses) => {
                for (let res of responses.reverse()) {
                    ret.push(...res.data)
                }
                ret.push(...lastData)

                ret = Helpers.parseBinanceKLines(ret)

                let fs = require('fs');
                fs.writeFileSync(__dirname + '/../Testing/testingCandles.json', JSON.stringify(ret));

                startSimulation();
            }))
        }
    }).catch(err => console.error(err))

    const startSimulation = () => {
        let slowEma = new MovingAvarage({
            id: 0,
            tag: 'Slow 18',
            period: 18,
            type: MovingAvaragesTypes.Exponential,
            source: 'close',
            timeFrame: TimeFrame[interval],
            chart: 0,
        })

        let mediumEma = new MovingAvarage({
            id: 1,
            tag: 'Medium 9',
            period: 9,
            type: MovingAvaragesTypes.Exponential,
            source: 'close',
            timeFrame: TimeFrame[interval],
            chart: 0,
        })

        let fastEma = new MovingAvarage({
            id: 2,
            tag: 'Fast 4',
            period: 4,
            type: MovingAvaragesTypes.Exponential,
            source: 'close',
            timeFrame: TimeFrame[interval],
            chart: 0,
        })

        let RSI = new RelativeStrengthIndex({
            id: 3,
            tag: 'RSI',
            timeFrame: TimeFrame[interval],
            chart: 1,
        })


        let rsiUpBand = new Line({
            id: 4,
            tag: 'RSIUPBand',
            timeFrame: TimeFrame[interval],
            position: 65,
            chart: 1
        })

        let rsiLowBand = new Line({
            id: 5,
            tag: 'RSILowBand',
            timeFrame: TimeFrame[interval],
            position: 35,
            chart: 1
        })

        let ADX = new AvarageDirectionalIndex({
            id: 6,
            tag: 'ADX',
            timeFrame: TimeFrame[interval],
            chart: 1
        })

        let adxLine = new Line({
            id: 7,
            tag: 'ADX Open Line',
            timeFrame: TimeFrame[interval],
            position: 35,
            chart: 1
        })
        let adxCloseLine = new Line({
            id: 8,
            tag: 'ADX Close Line',
            timeFrame: TimeFrame[interval],
            position: 30,
            chart: 1
        })

        let longSignal1 = new Signal({
            direction: TradingDirections.Long,
            indicators: [fastEma, mediumEma],
            type: SignalTypes.over
        })

        let longSignal2 = new Signal({
            direction: TradingDirections.Long,
            indicators: [mediumEma, slowEma],
            type: SignalTypes.over
        })

        let longSignalRSI = new Signal({
            direction: TradingDirections.Long,
            indicators: [RSI, rsiLowBand],
            type: SignalTypes.under
        })

        let longSignalADX = new Signal({
            direction: TradingDirections.Long,
            indicators: [ADX, adxLine],
            type: SignalTypes.over
        })

        let closeLongSignal1 = new Signal({
            direction: TradingDirections.CloseLong,
            indicators: [fastEma, mediumEma],
            type: SignalTypes.under
        })

        let closeLongSignal2 = new Signal({
            direction: TradingDirections.CloseLong,
            indicators: [ADX, adxCloseLine],
            type: SignalTypes.under
        })

        let shortSignal1 = new Signal({
            direction: TradingDirections.Short,
            indicators: [fastEma, mediumEma],
            type: SignalTypes.under
        })

        let shortSignal2 = new Signal({
            direction: TradingDirections.Short,
            indicators: [mediumEma, slowEma],
            type: SignalTypes.under
        })

        let shortSignalRSI = new Signal({
            direction: TradingDirections.Short,
            indicators: [RSI, rsiUpBand],
            type: SignalTypes.over
        })

        let shortSignalADX = new Signal({
            direction: TradingDirections.Short,
            indicators: [ADX, adxLine],
            type: SignalTypes.over
        })

        let closeShortSignal1 = new Signal({
            direction: TradingDirections.CloseShort,
            indicators: [fastEma, mediumEma],
            type: SignalTypes.over
        })

        let closeShortSignal2 = new Signal({
            direction: TradingDirections.CloseShort,
            indicators: [ADX, adxCloseLine],
            type: SignalTypes.under
        })

        let logger = new Logger({
            path: __dirname + '/../Testing/log' + Date.now(),
            saveLog: true,
        })

        let fs = require('fs');
        let candles: Candle[] = JSON.parse(fs.readFileSync(__dirname + '/../Testing/testingCandles.json'));

        let startTime = 0
        candles.forEach((candle: Candle, i: number) => { if (i == startCandle) startTime = Number(candle.closeTime) })

        if (!startTime) res.send('Debe indicar una vela de inicio para la simulación').status(400)

        var tripleEmaStrategy = new Strategy({
            signals: [longSignal1, longSignal2, longSignalADX, closeLongSignal1, closeLongSignal2, shortSignal1, shortSignal2, shortSignalADX, closeShortSignal1, closeShortSignal2],
            timeFrame: TimeFrame[interval],
            founds: [100],
            risk: 0.5,
            leverage: 5,
            timedCandles: [{
                timeFrame: TimeFrame[interval],
                candles: candles
            }],
            startTime: startTime,
            stopLoss: 8,
            takeProfit: 18,
            logger: logger,
            minimumSize: 2,
        })
        tripleEmaStrategy.initializeStrategy().then(msg => {
            res.send({
                simulationStartTime: candles[0].closeTime,
                timeStep: TimeFrame[interval],
                indicators: tripleEmaStrategy.indicators.map(indicator => Object({
                    chart: indicator.chart,
                    period: indicator.period,
                    tag: indicator.tag,
                    values: indicator.valueArray,
                })),
                price: candles,
                results: logger.results
            })
        }).catch(err => {
            console.error(err)
            res.send(err).status(500)
        })

    }
}, err => console.error(err))

app.listen(PORT, () => console.log(`Server listening on Port ${PORT}`))