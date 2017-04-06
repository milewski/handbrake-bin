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

    it('should have the right file permission', function(done) {

        installer.setup(process.platform)
            .then(cli => {

                if (process.platform === 'linux')
                    this.skip()

                fs.access(cli, fs.constants.R_OK | fs.constants.W_OK, err => {
                    done(err)
                });

            })

    });

    it('should have the right version number', done => {
        console.log(HandbrakeCLIPath)
        execFile(HandbrakeCLIPath, [ '--version' ], (error, stdout) => {
            expect(new RegExp(`HandBrake ${VERSION}`).test(stdout)).to.be(true)
            done()
        })

    });

})
