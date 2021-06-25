import LineConfig from "../../interfaces/Indicators/LineConfig";
import Indicator from "../Indicator";

export default class Line extends Indicator {
    constructor(config: LineConfig) {
        let _this = <LineConfig>{}
        Object.assign(_this, config);
        _this.formule = () => { return _this.position }
        super(_this)
    }
}