import Candle from "./interfaces/Candle"

export default class Helpers {
    static parseBinanceKLines(klines: number[][]) {
        let ret: Candle[] = [];
        for (let kline of klines) {
            ret.push({
                openTime: kline[0],
                open: kline[1],
                high: kline[2],
                low: kline[3],
                close: kline[4],
                volume: kline[5],
                closeTime: kline[6],
                quoteAssetVolume: kline[7],
                numberOfTrades: kline[8],
                takerBuyBaseAssetVolume: kline[9],
                takerBuyQuoteAssetVolume: kline[10],

            })
        }
        return ret
    }

    static convertAndSave(filePath: string) {
        let fs = require('fs');
        let rawData = JSON.parse(fs.readFileSync(filePath));
        let convertedData = this.parseBinanceKLines(rawData);
        fs.writeFile(filePath + 'Converted', JSON.stringify(convertedData));
    }
}