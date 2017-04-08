import * as fs from "fs";
import * as glob from "glob";
import { HandbrakeCLIPath, path } from "../source/HandBrake";

export function cleanUp() {
    try {
        glob.sync('*.{dmg,zip,exe}', { absolute: true })
            .concat([HandbrakeCLIPath])
            .forEach(file => fs.unlinkSync(file))
    } catch (e) {
        // do nothing
    }
}
