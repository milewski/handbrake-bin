import * as expect from "expect.js";
import { Installer, VERSION } from "../source/Installer";
import * as path from "path";
import * as fs from "fs";
import { HandbrakeCLIPath } from "../source/HandBrake";
import { execFile } from "child_process";

describe('HandBrake', () => {

    let installer;

    before(() => {
        return fs.unlinkSync(HandbrakeCLIPath)
    });

    beforeEach(() => {
        installer = new Installer()
    });

    it('should fail in unsupported platform', () => {

        expect(installer.setup)
            .withArgs('AlienOS').to.throwException(/Unsupported Platform: AlienOS/);

    });

    it('should download file properly', () => {

        return installer.setup('darwin')
            .then(cli => {
                expect(cli).to.be(path.resolve(__dirname, '..', 'bin/HandbrakeCLI'))
            })

    });

    it('should have the right file permission', () => {

        return installer.setup('darwin')
            .then(cli => {
                expect(fs.statSync(cli).mode).to.be(33261)
            })

    });

    it('should have the right version number', done => {

        execFile(HandbrakeCLIPath, ['--version'], (error, stdout) => {
            expect(new RegExp(`HandBrake ${VERSION}`).test(stdout)).to.be(true)
            done()
        })

    });

})
