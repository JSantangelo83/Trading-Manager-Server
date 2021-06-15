export default interface Candle {
    openTime?: number,
    open?: number,
    high?: number,
    low?: number,
    close?: number,
    volume?: number,
    closeTime?: number,
    quoteAssetVolume?: number,
    numberOfTrades?: number,
    takerBuyBaseAssetVolume?: number,
    takerBuyQuoteAssetVolume?: number,
}