import MovingAvaragesTypes from "../../enums/MovingAvaragesTypes";
import TimeFrame from "../../enums/TimeFrames";
import IndicatorConfig from "../IndicatorConfig";

export default interface MovingAvaragesConfig extends IndicatorConfig {
    type: MovingAvaragesTypes,
    timeFrame: TimeFrame,
}