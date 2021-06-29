import TimeFrame from "../../enums/TimeFrames";
import LineConfig from "../../interfaces/Indicators/LineConfig";
import Indicator from "../Indicator";

export default class Line extends Indicator {
    constructor(config: LineConfig) {
        let _this = <LineConfig>{}
        _this.timeFrame = TimeFrame['1h'] //THIS NEEDS TO BE IN THE INDEX.TS FILE
        Object.assign(_this, config);
        _this.formule = () => { return _this.position }
        super(_this)
    }
}