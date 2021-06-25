// import Indicator from "../Indicator";
// import Candle from "../../interfaces/Candle";
// import IndicatorConfig from "../../interfaces/IndicatorConfig";

// export default class RelativeStrengthIndex extends Indicator {
//     constructor(config: RelativeStrengthIndexConfig) {
//         let _this: RelativeStrengthIndexConfig = <RelativeStrengthIndexConfig>{};
//         Object.assign(_this, config);

//         _this.formule = (candle: Candle, historicalCandles: Candle[]) => {
//             //TODO Test if any 'candle' hasn't 'source' property. 
//             if (historicalCandles.length >= _this.period) {
//                 return (historicalCandles.slice(historicalCandles.length - _this.period + 1).map(candle => candle[_this.source]).reduce((vs, v) => vs! + v!)! + candle[_this.source]!) / _this.period
//             }
//             return -1
//         };
//         super(<IndicatorConfig>_this)
//     }
// }