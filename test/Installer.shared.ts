import * as expect from "expect.js";
import { Installer, VERSION } from "../source/Installer";
import * as fs from "fs";
import { HandbrakeCLIPath } from "../source/HandBrake";
import { execFile } from "child_process";
import { cleanUp } from "./helpers";

describe('handbrake:shared', () => {

    let installer;

    before(() => cleanUp());

    beforeEach(() => {
        installer = new Installer({
            deleteInstallationArchive: false
        });
    });

    it('should fail in unsupported platform', () => {

        expect(installer.setup.bind(installer))
            .withArgs('AlienOS').to.throwException(/Unsupported Platform: AlienOS/);

    });

    it('should have the right file permission', function() {

        return installer.setup(process.platform)
            .then(cli => {

                if (process.platform === 'linux')
                    this.skip()

                return new Promise((resolve, reject) => {
                    fs.access(cli, (fs.constants || fs)['R_OK'] | (fs.constants || fs)['W_OK'], error => {
                        if (error) reject(error)
                        resolve()
                    });
                })

            })

    });

    it('should have the right version number', done => {

        execFile(HandbrakeCLIPath, ['--version'], (error, stdout) => {
            expect(new RegExp(`HandBrake ${VERSION}`).test(stdout)).to.be(true)
            done()
        })

    });

})
