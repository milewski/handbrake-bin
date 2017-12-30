import { spawnSync } from 'child_process'
import { join } from 'path'
import { Installer } from './Installer'

let path: string

switch (process.platform) {
    case 'darwin':
        path = join(__dirname, '..', 'bin', 'HandbrakeCLI')
        break
    case 'win32':
        path = join(__dirname, '..', 'bin', 'HandbrakeCLI.exe')
        break
    case 'linux':
        path = spawnSync('which', ['HandBrakeCLI'])
            .stdout.toString()
            .trim()
        break
}

export default path
export { path }
export const HandbrakeCLIPath = path

export function install() {
    return new Installer().setup(process.platform)
}
