import { SignalTypes } from "../enums/SignalTypes";
import SignalConfig from "../interfaces/SignalConfig";


interface Signal extends SignalConfig { }
/*
* Triggers callback on condition
*/
class Signal {
    //Runtime Properties
    /** The state of the signal */
    state: boolean = false

    constructor(config: SignalConfig) {
        Object.assign(this, config);
        //Default Values
        this.margin = this.margin || 1
        this.duration = this.duration || 0;

        //Error Handling
        if (this.duration < this.margin && this.duration != 0) throw new Error('Duration of signal cannot be smaller than margin')
    }

    calculateNewState() {
        if (this.type == SignalTypes.over || this.type == SignalTypes.under) {
            if (this.indicators.length < 2) throw new Error('Must provide 2 indicators to "over" and "under" Signal type')
            let marginArr0 = this.indicators[0].getLastValues(this.margin!!);
            let marginArr1 = this.indicators[1].getLastValues(this.margin!);

            let marginFilter = this.type == SignalTypes.over ? (v: number, i: number) => v > marginArr1[i] : (v: number, i: number) => v < marginArr1[i]
            let byMargin = marginArr0.every(marginFilter);
            let byDuration = true;
            if (this.duration) {
                let durationArr0 = this.indicators[0].getLastValues(this.margin! + this.duration + 1)
                let durationArr1 = this.indicators[1].getLastValues(this.margin! + this.duration + 1)
                let durationFilter = this.type == SignalTypes.over ? (v: number, i: number) => v > durationArr1[i] : (v: number, i: number) => v < durationArr1[i]
                byDuration = !durationArr0.every(durationFilter);
            }
            return (byMargin && byDuration);
        }
        return false
    }

    getState() {
        return this.calculateNewState()
    }

}

export default Signal;