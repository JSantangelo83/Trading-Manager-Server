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
}