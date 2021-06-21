import MovingAvaragesTypes from "../../enums/MovingAvaragesTypes";
import TimeFrame from "../../enums/TimeFrames";
import IndicatorConfig from "../IndicatorConfig";

export default interface MovingAvaragesConfig extends IndicatorConfig {
    period: number,
    type: MovingAvaragesTypes,
    source: "close" | "high" | "low"; //Needs to improve
    timeFrame: TimeFrame,
}