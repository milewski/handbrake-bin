export declare const VERSION = "1.0.3";
export declare class Installer {
    private win32;
    private darwin;
    private linux;
    private platform;
    private options;
    constructor(options?: {});
    setup(platform: string): Promise<string>;
    private exec(command);
    private checkVersion(stdout);
    deleteInstallationArchive(): Promise<{}>;
    private installLinux();
    private install(installation);
    private extractFile({archive, copyFrom, copyTo});
    private downloadFile(from, to);
}
