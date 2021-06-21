import PositionConfig from "../interfaces/PositionConfig";

interface Position extends PositionConfig { }
class Position {
    constructor(config: PositionConfig) {
        Object.assign(this, config)
    }
}

export default Position;