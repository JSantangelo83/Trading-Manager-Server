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

app.get('/', (req, res) => {
    res.send('test passed')
})

app.get('/convert', (req, res) => {
    Helpers.convertAndSave('./src/TestingData/BtcUsdt1h.json');
    res.send('todo piola :D');
})

app.get('/test', (req, res) => {
    let slowEma = new MovingAvarage({
        id: 0,
        tag: 'slow',
        period: 200,
        type: MovingAvaragesTypes.Simple,
        target: 'close',
        timeFrame:TimeFrame['1h'],
    })


    let fastEma = new MovingAvarage({
        id: 1,
        tag: 'fast',
        period: 20,
        type: MovingAvaragesTypes.Simple,
        target: 'close',
        timeFrame:TimeFrame['1h'],
    })

    let exponentialEma = new MovingAvarage({
        id: 1,
        tag: 'exponential',
        period: 20,
        type: MovingAvaragesTypes.Exponential,
        target: 'close',
        timeFrame:TimeFrame['1h'],
    })

    let longSignal = new Signal({
        direction: TradingDirections.Long,
        indicators: [fastEma, slowEma],
        type: SignalTypes.over
    })

    let shortSignal = new Signal({
        direction: TradingDirections.Short,
        indicators: [slowEma, fastEma],
        type: SignalTypes.over
    })

    let fs = require('fs');
    let candles: Candle[] = JSON.parse(fs.readFileSync('./src/TestingData/BtcUsdt1hConverted.json'));
    let doubleEmaStrategy = new Strategy({
        signals: [longSignal, shortSignal],
        timeFrame: TimeFrame['1h'],
        timedCandles: [{
            timeFrame: TimeFrame['1h'],
            candles: candles
        }],
        startTime: 1621735200000,
    })

    res.send('already did everything')
})

app.listen(PORT, () => console.log(`Server listening on Port ${PORT}`))