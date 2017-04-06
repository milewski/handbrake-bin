import { join } from "path";
import { Installer } from "./Installer";
import { execSync } from "child_process";

let path: string;

switch (process.platform) {
    case 'darwin':
        path = join(__dirname, '..', 'bin', 'HandbrakeCLI')
        break
    case 'win32':
        path = join(__dirname, '..', 'bin', 'HandbrakeCLI.exe')
        break
    case 'linux':
        path = execSync('which HandbrakeCLI', { encoding: 'utf8' })
        break
}

export default path
export { path }
export const HandbrakeCLIPath = path
export function install() {
    return new Installer().setup(process.platform);
}
