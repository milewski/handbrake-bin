export declare const VERSION = "1.0.3";
export declare class Installer {
    private win32;
    private darwin;
    private linux;
    setup(platform: string): Promise<string>;
    private install(installation);
    private extractFile({archive, copyFrom, copyTo});
    private downloadFile(from, to);
}
