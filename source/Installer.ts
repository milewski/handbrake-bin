#!/usr/bin/env node

import * as request from "request";
import * as unzip from "unzip";
import { exec } from "child_process";
import * as util from "util";
import * as fs from "fs-extra";
import * as path from "path";
import * as rimraf from "rimraf";
import * as version from 'semver';

import { InstallationInterface } from "./insterfaces/InstallationInterface";

export const VERSION = '1.0.3';
const DOWNLOAD_PATH = 'https://download.handbrake.fr/releases/%s/HandBrakeCLI-%s%s';

export class Installer {

    private win32: InstallationInterface = {
        url: util.format(DOWNLOAD_PATH, VERSION, VERSION, '-win-x86_64.zip'),
        archive: 'win.zip',
        copyFrom: path.join('unzipped', 'HandBrakeCLI.exe'),
        copyTo: path.join('bin', 'HandbrakeCLI.exe')
    }

    private darwin: InstallationInterface = {
        url: util.format(DOWNLOAD_PATH, VERSION, VERSION, '.dmg'),
        archive: 'mac.dmg',
        copyFrom: 'HandbrakeCLI',
        copyTo: path.join('bin', 'HandbrakeCLI')
    }

    private linux;

    public setup(platform: string) {

        if (platform === 'linux') {
            return new Promise((resolve, reject) => {
                exec('npm run install:ubuntu', (error, stdout) => {
                    if (error) throw reject(error)
                    resolve(stdout)
                })
            })
        }

        if (!platform.match(/(win32|darwin)/)) {
            throw `Unsupported Platform: ${platform}`
        }

        const installation = this[ platform ];

        if (fs.existsSync(path.resolve(__dirname, '..', installation.copyTo))) {

            return new Promise((resolve, reject) => {
                exec(`${installation.copyTo} --version`, (error, stdout) => {

                    if (error) throw reject(error)

                    let [ currentVersion ] = /[\d.]+/.exec(stdout);

                    if (version.gte(currentVersion, VERSION)) {
                        console.log('You already have the latest HandbrakeCLI installed')
                        resolve()
                    } else {
                        this.install(installation).then(resolve)
                    }

                })
            })

        }

        return this.install(installation)

    }

    private install(installation: InstallationInterface) {

        return this
            .downloadFile(installation.url, installation.archive)
            .then(() => {

                fs.ensureDirSync('bin')

                return this.extractFile(installation)
                    .then(() => {
                        fs.unlinkSync(installation.archive)
                    })

            })

    }

    private extractFile({ archive, copyFrom, copyTo }) {

        console.log(`extracting: ${copyFrom}`)

        return new Promise(resolve => {

            if (archive.endsWith('.zip')) {

                fs.ensureDirSync('unzipped')

                const unzipped = unzip.Extract({ path: 'unzipped' })

                unzipped.on('close', () => {

                    const source = fs.createReadStream(copyFrom)
                    const destination = fs.createWriteStream(copyTo)

                    destination.on('close', () => {
                        rimraf('unzipped', resolve)
                    })

                    source.pipe(destination);

                })

                fs.createReadStream(archive).pipe(unzipped)

            }

            if (archive.endsWith('.dmg')) {

                const cmd = `hdiutil attach ${archive}`

                exec(cmd, (err, stdout) => {

                    if (err) throw err

                    const match = stdout.match(/^(\/dev\/\w+)\b.*(\/Volumes\/.*)$/m)

                    if (match) {

                        let devicePath = match[ 1 ],
                            mountPath = match[ 2 ]

                        copyFrom = path.join(mountPath, copyFrom);

                        let source = fs.createReadStream(copyFrom),
                            destination = fs.createWriteStream(copyTo, { mode: parseInt('755', 8) })

                        destination.on('close', function() {
                            exec(`hdiutil detach ${devicePath}`, (error, stdout) => {
                                if (error) throw error
                                resolve(stdout)
                            })
                        })

                        source.pipe(destination)

                    }

                })
            }

        })

    }

    private downloadFile(from: string, to: string) {

        console.log(`downloading binary from: ${from}`);

        return new Promise(accept => {

            const req = request(from);
            const download = fs.createWriteStream(to);
            download.once('close', accept)

            req.pipe(download);

        })

    }

}

let options = {}

process.argv.slice(2)
    .forEach(item => {
        options[ item.replace('--', '') ] = true
    })

if (options[ 'auto-install' ]) {
    new Installer()
        .setup(process.platform)
        .then(function() {
            console.log(`HandbrakeCLI ${VERSION} installation complete`)
        });
}
