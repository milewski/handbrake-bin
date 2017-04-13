#!/usr/bin/env node

import * as unzip from "unzip";
import { exec } from "child_process";
import * as util from "util";
import * as fs from "fs-extra";
import * as path from "path";
import * as rimraf from "rimraf";
import * as version from "semver";
import * as download from "download";
import * as Progress from "progress";
import * as AppRoot from "app-root-path";

import { InstallationInterface } from "./interfaces/InstallationInterface";
import { HandbrakeCLIPath } from "./HandBrake";

export const VERSION = (process.platform === 'linux') ? '1.0.4' : '1.0.7';
export const DOWNLOAD_PATH = 'https://download.handbrake.fr/releases/%s/HandBrakeCLI-%s%s';

export class Installer {

    private win32: InstallationInterface = {
        url: util.format(DOWNLOAD_PATH, VERSION, VERSION, '-win-x86_64.zip'),
        archive: `HandBrakeCLI-${VERSION}-win-x86_64.zip`,
        copyFrom: path.join('unzipped', 'HandBrakeCLI.exe'),
        copyTo: path.join('bin', 'HandbrakeCLI.exe')
    }

    private darwin: InstallationInterface = {
        url: util.format(DOWNLOAD_PATH, VERSION, VERSION, '.dmg'),
        archive: `HandBrakeCLI-${VERSION}.dmg`,
        copyFrom: 'HandbrakeCLI',
        copyTo: path.join('bin', 'HandbrakeCLI')
    }

    private linux = '\n\n\
        Linux users\n\
        ============\n\
        handbrake-cli must be installed separately as the root user.\n\
        Ubuntu users can do this using the following commands:\n\
        \n\
        add-apt-repository --yes ppa:stebbins/handbrake-releases\n\
        apt-get update -qq\n\
        apt-get install -qq handbrake-cli\n\
        \n\
        For all issues regarding installation of HandbrakeCLI on Linux, consult the Handbrake website:\n\
        http://handbrake.fr\n'

    private platform: string;
    private options = {
        deleteInstallationArchive: true
    }

    constructor(options = {}) {
        Object.assign(this.options, options)
    }

    public setup(platform: string): Promise<string> {

        this.platform = platform;

        if (!platform.match(/(win32|darwin|linux)/)) {
            throw `Unsupported Platform: ${platform}`
        }

        if (platform === 'linux') {
            return this.installLinux();
        }

        const installation = this[platform];

        if (fs.existsSync(path.resolve(__dirname, '..', installation.copyTo))) {

            return this.exec(`${installation.copyTo} --version`).then(result => {

                if (this.checkVersion(result)) {
                    return HandbrakeCLIPath
                }

                return this.install(installation).then(() => HandbrakeCLIPath)

            })

        }

        return this.install(installation).then(() => HandbrakeCLIPath)

    }

    private exec(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout) => {
                if (error) reject(error)
                resolve(stdout)
            })
        })
    }

    private checkVersion(stdout: string): Boolean {

        if (!stdout.length) return false;

        let [currentVersion] = /[\d.]+/.exec(stdout);

        if (version.gte(currentVersion, VERSION)) {
            console.log('You already have the latest HandbrakeCLI installed')
            return true
        }

        return false;

    }

    public deleteInstallationArchive() {
        return new Promise((resolve, reject) => {
            fs.unlink(this[this.platform].archive, error => {
                if (error) reject(error)
                resolve()
            })
        })
    }

    private installLinux() {

        let command = 'chmod +x source/install-ubuntu.sh && npm run install:ubuntu',
            install = () => {
                return this
                    .exec(command)
                    .then(() => HandbrakeCLIPath)
                    .catch(() => {
                        console.log(this.linux)
                    })
            }

        if (!HandbrakeCLIPath) {
            return install()
        }

        return this
            .exec(`${HandbrakeCLIPath} --version`)
            .then(result => {

                if (this.checkVersion(result))
                    return HandbrakeCLIPath

                return install()

            })

    }

    private install(installation: InstallationInterface) {

        return this
            .downloadFile(installation.url, installation.archive)
            .then(() => {

                fs.ensureDirSync('bin')

                return this
                    .extractFile(installation)
                    .then(() => {
                        if (this.options.deleteInstallationArchive)
                            return this.deleteInstallationArchive()
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

                exec(`hdiutil attach ${archive}`, (err, stdout) => {

                    if (err) throw err

                    const match = stdout.match(/^(\/dev\/\w+)\b.*(\/Volumes\/.*)$/m)

                    if (match) {

                        let devicePath = match[1],
                            mountPath = match[2]

                        copyFrom = path.join(mountPath, copyFrom);

                        let source = fs.createReadStream(copyFrom),
                            destination = fs.createWriteStream(copyTo, { mode: parseInt('755', 8) })

                        destination.on('close', () => {
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

            /**
             * Check if file is available locally before attempting to download it
             */
            let { base } = path.parse(from),
                archive = AppRoot.resolve(base);

            if (fs.existsSync(archive) || fs.existsSync(to)) {
                console.log('binary was found locally, using it instead');
                let action = this.options.deleteInstallationArchive ? 'move' : 'copy';
                return fs[action](archive, base, accept);
            }

            download(from).on('response', response => {

                const bar = new Progress('[:bar] :percent :etas', {
                    complete: '=',
                    incomplete: '.',
                    width: 30,
                    total: parseInt(response.headers['content-length'], 10)
                });

                response.on('data', chunk => bar.tick(chunk.length));

            }).then(data => fs.writeFile(to, data, accept))

        })

    }

}

let options = {}

process.argv.slice(2)
    .forEach(item => {
        options[item.replace('--', '')] = true
    })

if (options['install']) {
    new Installer()
        .setup(process.platform)
        .then(() => {
            console.log(`HandbrakeCLI ${VERSION} installation complete`)
        });
} else if (Object.keys(options).length) {
    console.log('Invalid Arguments: ' + JSON.stringify(options))
}
