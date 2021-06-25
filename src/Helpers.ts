import Candle from "./interfaces/Candle"

export default class Helpers {
    static parseBinanceKLines(klines: any[][]) {
        let ret: Candle[] = [];
        for (let kline of klines) {
            ret.push({
                openTime: kline[0],
                open: parseFloat(kline[1]),
                high: parseFloat(kline[2]),
                low: parseFloat(kline[3]),
                close: parseFloat(kline[4]),
                volume: parseFloat(kline[5]),
                closeTime: kline[6],
                quoteAssetVolume: parseFloat(kline[7]),
                numberOfTrades: kline[8],
                takerBuyBaseAssetVolume: parseFloat(kline[9]),
                takerBuyQuoteAssetVolume: parseFloat(kline[10]),

            })
        }
        return ret
    }

    static convertAndSave(filePath: string) {
        let fs = require('fs');
        let rawData = JSON.parse(fs.readFileSync(filePath));
        let convertedData = this.parseBinanceKLines(rawData);
        fs.writeFileSync(filePath + 'Converted.json', JSON.stringify(convertedData));
    }

    static formatFloat(num: number, decimals: number = 2) { return Number(num.toFixed(decimals)) }

    static parseResult(filePath: string) {
        let fs = require('fs');
        let rawData = JSON.parse(fs.readFileSync(filePath));
        rawData.forEach((r: any) => console.log(r))
        let convertedData: string[] = []
        let from: number
        let until: number
        let founds = 30
        let leverage = 10
        rawData.forEach((line: string, i: number) => {
            if (i === 0) { convertedData.push(line.split(' ')[0] + ' From: ' + line.replace(']', '').replace('[', '').split(':')[1].split(',').map((n: string) => { from = Number(n); return from })[1]) }
            else {
                if (convertedData[convertedData.length - 1].split(' ')[0] != line.split(' ')[0]) {
                    console.log(from)
                    convertedData[convertedData.length - 1] += (' Until: ' + rawData[i - 1].replace(']', '').replace('[', '').split(':')[1].split(',').map((n: string) => { until = Number(n); return until })[1])
                    founds += ((Number((convertedData[convertedData.length - 1].split(' ')[0] === 'Short' ? (100 - (until * 100 / from)) : (until * 100 / from) - 100) || 0) * leverage * founds) / 100)
                    convertedData[convertedData.length - 1] += ' | FOUNDS: ' + founds
                    convertedData[convertedData.length - 1] += ' | RESULT: ' + ((convertedData[convertedData.length - 1].split(' ')[0] === 'Short' ? (100 - (until * 100 / from)) : (until * 100 / from) - 100))
                    from = line.replace(']', '').replace('[', '').split(':')[1].split(',').map((n: string) => Number(n))[1]
                    convertedData.push(line.split(' ')[0] + ' From: ' + from)
                }
            }
        })
        convertedData.push('FINAL RESULT: ' + convertedData.map(line => Number(line.split('T: ')[1] || 0)).reduce((v, vs) => v! + vs!)! + '%')
        convertedData.push('FINAL FOUNDS: ' + founds)
        fs.writeFileSync(filePath + ' parsed.json', JSON.stringify(convertedData));
    }

    static log(line: string) {
        console.log(line)
    }
}