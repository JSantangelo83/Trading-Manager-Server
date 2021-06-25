import express from 'express';
import MovingAvarage from './entities/Indicators/MovingAvarage';
import Strategy from './entities/Strategy';
import MovingAvaragesTypes from './enums/MovingAvaragesTypes';
import Signal from './entities/Signal';
import { TradingDirections } from './enums/TradingDirections';
import { SignalTypes } from './enums/SignalTypes';
import TimeFrame from './enums/TimeFrames';
import Helpers from './Helpers';
import Candle from './interfaces/Candle';

const app = express();
const PORT = 3000;

app.use(express.json())
app.use(express.urlencoded())

app.get('/', (req, res) => {
    res.send('test passed')
})

app.get('/convert', (req, res) => {
    Helpers.convertAndSave(__dirname + '/../Testing/BtcUsdt1h.json');
    res.send('todo piola :D');
})

app.get('/parseresult', (req, res) => {
    Helpers.parseResult(__dirname + '/../Testing/results.json');
    res.send('Parseado pei ;)');
})

app.get('/test', (req, res) => {
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

    let fs = require('fs');
    let candles: Candle[] = JSON.parse(fs.readFileSync(__dirname + '/../Testing/BtcUsdt1hConverted.json'));
    let tripleEmaStrategy = new Strategy({
        signals: [longSignal1, longSignal2, shortSignal1, shortSignal2],
        timeFrame: TimeFrame['1h'],
        founds: [100],
        timedCandles: [{
            timeFrame: TimeFrame['1h'],
            candles: candles
        }],
        startTime: 1621735200000,
    })

    res.send('already did everything')
})

app.listen(PORT, () => console.log(`Server listening on Port ${PORT}`))