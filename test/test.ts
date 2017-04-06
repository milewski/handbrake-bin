import * as Mocha from "mocha";
import * as path from "path";
import * as glob from "glob";

const mocha = new Mocha({
    grep: new RegExp(`${process.platform}|shared`),
    timeout: Infinity
});

glob.sync(path.join(__dirname, '**/*.js'), { ignore: '**/+(test/helpers).*' })
    .forEach(file => mocha.addFile(file));

mocha.run(failures => {
    process.on('exit', () => {
        process.exit(failures);
    });
});
