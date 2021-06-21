import { SignalTypes } from "../enums/SignalTypes";
import { TradingDirections } from "../enums/TradingDirections";
import SignalConfig from "../interfaces/SignalConfig";
import Indicator from "./Indicator";

/*
* Triggers callback on condition
*/
export default class Signal {
    //Config Properties
    type: SignalTypes
    indicators: Indicator[];
    duration: number;
    margin: number;
    direction: TradingDirections
    //Runtime Properties
    state: boolean = false
    
    constructor(config: SignalConfig) {
        this.type = config.type;
        this.indicators = config.indicators
        this.direction = config.direction
        this.margin = config.margin ? config.margin : 1
        this.duration = config.duration ? config.duration : 0;
        if (this.duration < this.margin && this.duration != 0) throw new Error('Duration of signal cannot be smaller than margin')
    }

    calculateNewState() {
        if (this.type == SignalTypes.over || this.type == SignalTypes.under) {
            if (this.indicators.length < 2) throw new Error('Must provide 2 indicators to "over" and "under" Signal type')
            let marginArr0 = this.indicators[0].getLastValues(this.margin);
            let marginArr1 = this.indicators[1].getLastValues(this.margin);

            let marginFilter = this.type == SignalTypes.over ? (v: number, i: number) => v > marginArr1[i] : (v: number, i: number) => v < marginArr1[i]
            let byMargin = marginArr0.every(marginFilter);
            let byDuration = true;
            if (this.duration) {
                let durationArr0 = this.indicators[0].getLastValues(this.margin + this.duration + 1)
                let durationArr1 = this.indicators[1].getLastValues(this.margin + this.duration + 1)
                let durationFilter = this.type == SignalTypes.over ? (v: number, i: number) => v > durationArr1[i] : (v: number, i: number) => v < durationArr1[i]
                byDuration = !durationArr0.every(durationFilter);
            }
            return (byMargin && byDuration);
        }
        return false
    }

    getState() {
        let oldState = this.state
        this.state = this.calculateNewState();
        if (oldState != this.state) { return this.state }
        return false;
    }

}