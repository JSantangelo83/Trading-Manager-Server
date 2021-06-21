import { TradingDirections } from "../enums/TradingDirections";
import PositionConfig from "../interfaces/PositionConfig";

interface Position extends PositionConfig { }
class Position {
    constructor(config: PositionConfig) {
        Object.assign(this, config)

        //Error Handling
        if (!this.entryPrice || !this.entryTime) { throw new Error('Must indicate Entry Price and Entry Time for testing') }

        //ONLY FOR TESTING
        console.log('putting ' + (TradingDirections[this.direction].toString()) + ' at (time/price): ', [this.entryTime, this.entryPrice])
        //ONLY FOR TESTING
    }
}

export default Position;