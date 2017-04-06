import * as expect from "expect.js";
import { Installer } from "../source/Installer";
import * as path from "path";
import { cleanUp } from "./helpers";

describe('handbrake:win32', () => {

    let installer;

    before(() => cleanUp());

    beforeEach(() => {
        installer = new Installer({
            deleteInstallationArchive: false
        });
    });

    it('should download file properly', () => {

        return installer.setup('win32')
            .then(cli => {
                expect(cli).to.be(path.resolve(__dirname, '..', 'bin/HandbrakeCLI.exe'))
            })

    });

})
