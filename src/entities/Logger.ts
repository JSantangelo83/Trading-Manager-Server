import { TradingDirections } from "../enums/TradingDirections";
import Helpers from "../Helpers";
import LoggerConfig from "../interfaces/LoggerConfig";
import PositionResult from "../interfaces/PositionResult";

export default class Logger {
    results: PositionResult[]
    fs: any
    log: any[]
    constructor(config: LoggerConfig) {
        Object.assign(this, config)
        //Default Values
        this.results = []
        this.fs = require('fs')
        this.log = [];
    }

    addResult(result: PositionResult) {
        this.results.push(result)
        let logLine = `${result.result ? 'Good' : 'Bad'} ${TradingDirections[result.direction].toString()} ${result.percentage}% | ${result.result ? 'Win' : 'Loss'} on account: ${result.profit} | Duration: ${result.duration}h | from: ${Helpers.formatFloat(result.initialFounds)} to ${Helpers.formatFloat(result.finalFounds)} founds. ${result.liquidated || result.finalFounds <= 0 ? '| LIQUIDATED' : ''}`
        this.log.push(logLine)
    }

    //This function NEEDS to be improved
    logFinalResult(burned: boolean) {
        if (burned) {
            // console.log('---------------------------Your account was burned, end of game :c ---------------------------')
            this.log.push('---------------------------Your account was burned, end of game :c ---------------------------')
        }
        //Calculating
        let bestSize = Math.max(...this.results.map(res => res.finalFounds))
        let openedPositions = this.results.length
        let wins = this.results.map(res => res.result).filter(result => result).length
        let losses = this.results.map(res => res.result).filter(result => !result).length
        let accurate = (wins * 100) / openedPositions
        let avarageWin = Helpers.formatFloat(this.results.map(res => res.profit).filter(profit => profit > 0).reduce((p, c) => p + c) / this.results.map(res => res.profit).filter(profit => profit > 0).length)
        let avarageLoss = Helpers.formatFloat(this.results.map(res => res.profit).filter(profit => profit < 0).reduce((p, c) => p + c) / this.results.map(res => res.profit).filter(profit => profit > 0).length)
        let finalSize = Helpers.formatFloat(this.results[this.results.length - 1].finalFounds)
        //Logging
        // console.log('')
        // console.log('--------------------------- Results ---------------------------')
        // console.log(`${openedPositions} positions were opened`)
        // console.log(`The account size currently is: ${finalSize}`)
        // console.log(`The bigger size account was: ${Helpers.formatFloat(bestSize)}`)
        // console.log(`Wins: ${wins}`)
        // console.log(`Avarage Win: $${avarageWin}`)
        // console.log(`Losses: ${losses}`)
        // console.log(`Avarage Loss: -$${Math.abs(avarageLoss)}`)
        // console.log(`Accurate: ${Helpers.formatFloat(accurate)}%`)
        // console.log('---------------------------------------------------------------------')

        this.log.push('')
        this.log.push('--------------------------- Results ---------------------------')
        this.log.push(`${openedPositions} positions were opened`)
        this.log.push(`The account size currently is: ${finalSize}`)
        this.log.push(`The bigger size account was: ${Helpers.formatFloat(bestSize)}`)
        this.log.push(`Wins: ${wins}`)
        this.log.push(`Avarage Win: $${avarageWin}`)
        this.log.push(`Losses: ${losses}`)
        this.log.push(`Avarage Loss: -$${Math.abs(avarageLoss)}`)
        this.log.push(`Accurate: ${Helpers.formatFloat(accurate)}%`)
        this.log.push('---------------------------------------------------------------------')

        let fs = require('fs');
        fs.writeFileSync(__dirname + '/../../Testing/Log' + Date.now() + '.json', JSON.stringify(this.log))

        throw 'Simulación Finalizada'

    }
}