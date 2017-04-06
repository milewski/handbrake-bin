import * as fs from "fs";
import { HandbrakeCLIPath } from "../source/HandBrake";

export function cleanUp() {
    try {
        fs.unlinkSync(HandbrakeCLIPath)
    } catch (e) {
        // do nothing
    }
}
