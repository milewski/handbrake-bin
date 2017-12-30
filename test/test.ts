import { execFile } from 'child_process'
import * as expect from 'expect.js'
import * as fs from 'fs'
import * as glob from 'glob'
import * as path from 'path'
import { HandbrakeCLIPath } from '../source/HandBrake'
import { Installer, VERSION } from '../source/Installer'

export function cleanUp() {
    try {
        glob.sync('*.{dmg,zip,exe}', { absolute: true }).forEach(file => fs.unlinkSync(file))
    } catch {
        // do nothing
    }
}

describe('handbrake', () => {
    let installer

    before(() => cleanUp())

    beforeEach(() => {
        installer = new Installer({
            deleteInstallationArchive: false
        })
    })

    it('should fail in unsupported platform', () => {
        expect(installer.setup.bind(installer))
            .withArgs('AlienOS')
            .to.throwException(/Unsupported Platform: AlienOS/)
    })

    it('should have the right file permission', function() {
        return installer.setup(process.platform).then(cli => {
            return new Promise((resolve, reject) => {
                fs.access(cli, (fs.constants || fs)['R_OK'] | (fs.constants || fs)['W_OK'], error => {
                    if (error) reject(error)
                    resolve()
                })
            })
        })
    })

    it('should have the right version number', done => {
        execFile(HandbrakeCLIPath, ['--version'], (error, stdout) => {
            expect(stdout).to.match(new RegExp(`HandBrake ${VERSION}?`))
            done()
        })
    })

    it('should download file properly', () => {
        const { platform } = process

        return installer.setup(platform).then(cli => {
            if (platform === 'win32') expect(cli).to.be(path.resolve(__dirname, '..', 'bin/HandbrakeCLI.exe'))

            if (platform === 'darwin') expect(cli).to.be(path.resolve(__dirname, '..', 'bin/HandbrakeCLI'))

            if (platform === 'linux') expect(cli).to.match(/HandBrakeCLI/)
        })
    })
})
