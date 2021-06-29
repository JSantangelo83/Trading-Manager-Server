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

const app = express();
const PORT = 3000;

app.use(express.json())
app.use(express.urlencoded())

app.get('/', (req, res) => {
    res.send('test passed')
})

// app.get('/convert', (req, res) => {
//     Helpers.convertAndSave(__dirname + '/../Testing/BtcUsdt1h.json');
//     res.send('todo piola :D');
// })

// app.get('/parseresult', (req, res) => {
//     Helpers.parseResult(__dirname + '/../Testing/results.json');
//     res.send('Parseado pei ;)');
// })

app.get('/test', (req, res) => {

    let apiUrl = 'https://api1.binance.com/api/v3/klines'

    let symbol = req.query.symbol
    let interval = req.query.interval
    let nKlines = Number(req.query.nKlines || 0)

    let dataReady: boolean = false
    //Error Handling
    if (!symbol || !interval || !nKlines) res.status(403).send('Must indicate Symbol, Interval and nKlines')

    let klines: Candle[]
    axios.get(`${apiUrl}?symbol=${symbol}&interval=${interval}&limit=${(nKlines < 1000 ? nKlines : 1000)}`).then(res => {
        if (nKlines <= 1000) { klines = Helpers.parseBinanceKLines(res.data) }
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
            tag: 'slow',
            period: 18,
            type: MovingAvaragesTypes.Exponential,
            source: 'close',
            timeFrame: TimeFrame['1h'],
        })


        let mediumEma = new MovingAvarage({
            id: 1,
            tag: 'medium',
            period: 9,
            type: MovingAvaragesTypes.Exponential,
            source: 'close',
            timeFrame: TimeFrame['1h'],
        })

        let fastEma = new MovingAvarage({
            id: 2,
            tag: 'fast',
            period: 4,
            type: MovingAvaragesTypes.Exponential,
            source: 'close',
            timeFrame: TimeFrame['1h'],
        })

        let RSI = new RelativeStrengthIndex({
            id: 3,
            tag: 'RSI',
            timeFrame: TimeFrame['1h'],
        })

        let rsiUpBand = new Line({
            id: 4,
            position: 70
        })

        let rsiLowBand = new Line({
            id: 5,
            position: 30
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

        let longSignal3 = new Signal({
            direction: TradingDirections.Long,
            indicators: [RSI, rsiLowBand],
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

        let shortSignal3 = new Signal({
            direction: TradingDirections.Short,
            indicators: [RSI, rsiUpBand],
            type: SignalTypes.over
        })

        let fs = require('fs');
        let candles: Candle[] = JSON.parse(fs.readFileSync(__dirname + '/../Testing/testingCandles.json'));

        let tripleEmaStrategy = new Strategy({
            signals: [longSignal1, longSignal2, longSignal3, shortSignal1, shortSignal2, shortSignal3],
            timeFrame: TimeFrame['1h'],
            founds: [100],
            risk: 1,
            timedCandles: [{
                timeFrame: TimeFrame['1h'],
                candles: candles
            }],
            startTime: 1600815599999,
        })

        res.send('already did everything')
    }
})

app.listen(PORT, () => console.log(`Server listening on Port ${PORT}`))