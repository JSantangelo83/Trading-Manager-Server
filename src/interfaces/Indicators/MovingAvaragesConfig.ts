import MovingAvaragesTypes from "../../enums/MovingAvaragesTypes";
import Candle from "../Candle";
import IndicatorConfig from "../IndicatorConfig";

export default interface MovingAvaragesConfig {
    period: number,
    type: MovingAvaragesTypes,
    target: "close" | "high" | "low"; //Needs to improve
}