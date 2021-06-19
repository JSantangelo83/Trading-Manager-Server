import MovingAvaragesTypes from "../../enums/MovingAvaragesTypes";
import TimeFrame from "../../enums/TimeFrames";
import Candle from "../Candle";
import Entity from "../Entity";
import IndicatorConfig from "../IndicatorConfig";

export default interface MovingAvaragesConfig extends Entity {
    period: number,
    type: MovingAvaragesTypes,
    target: "close" | "high" | "low"; //Needs to improve
    timeFrame: TimeFrame,
}