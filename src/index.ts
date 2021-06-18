import express from 'express';
import MovingAvarage from './entities/Indicators/MovingAvarage';
import Strategy from './entities/Strategy';
import MovingAvaragesTypes from './enums/MovingAvaragesTypes';
import Signal from './entities/Signal';
import { TradingDirections } from './enums/TradingDirections';
import { SignalTypes } from './enums/SignalTypes';
import TimeFrame from './enums/TimeFrames';
import Helpers from './Helpers';
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('test passed')
})

app.get('/convert',(req,res)=>{
    Helpers.convertAndSave('./TestingData/BtcUsdt1h.json');
})

app.get('/test', (req, res) => {
    let slowEma = new MovingAvarage({
        period: 200,
        type: MovingAvaragesTypes.Exponential,
        target: 'close',
    })

    let fastEma = new MovingAvarage({
        period: 20,
        type: MovingAvaragesTypes.Exponential,
        target: 'close',
    })

    let longSignal = new Signal({
        direction: TradingDirections.Long,
        indicators: [fastEma, slowEma],
        type: SignalTypes.over
    })

    let shortSignal = new Signal({
        direction: TradingDirections.Long,
        indicators: [slowEma, fastEma],
        type: SignalTypes.over
    })

    let doubleEmaStrategy = new Strategy({
        signals: [longSignal, shortSignal],
        timeFrame: TimeFrame['1h'],
        timedCandles: [{
            timeFrame: TimeFrame['1h'],
            candles: [

            ]
        }]


    })
    res.send('already did everything')
})

app.listen(PORT, () => console.log(`Server listening on Port ${PORT}`))