import * as expect from "expect.js";
import { Installer } from "../source/Installer";

describe('HandBrake', () => {

    it('should fail in unsupported platform', () => {

        let installer = new Installer()

        expect(installer.setup)
            .withArgs('AlienOS').to.throwException(/Unsupported Platform: AlienOS/);

    });

})
