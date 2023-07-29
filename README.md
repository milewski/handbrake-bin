# handbrake-bin

[![npm version](https://badge.fury.io/js/handbrake-bin.svg)](https://badge.fury.io/js/handbrake-bin)
[![npm downloads](https://img.shields.io/npm/dm/handbrake-bin.svg)](https://www.npmjs.com/package/handbrake-bin)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

> HandBrake is a tool for converting video from nearly any format to a selection of modern, widely supported codecs. More at [https://handbrake.fr/](https://handbrake.fr/)

# What is this?

This is a wrapper to install [HandBrake](https://handbrake.fr) as a local dependency through **npm**.

## Install

```bash
$ npm install handbrake-bin --save
```
_Linux users may need to run with sudo_

## Usage
```js
const execFile = require('child_process').execFile;
const handBrake = require('handbrake-bin');

execFile(handBrake, ['--input', 'input.mkv', '--output', 'output.mp4'], err => {
	console.log('Done');
});
```
Or you could pull [```object-to-spawn-args```](https://www.npmjs.com/package/object-to-spawn-args) and use like this:
```js
import { HandbrakeCLIPath } from 'handbrake-bin';
import toSpawnArgs from 'object-to-spawn-args';

const options = {
    input: 'input.mkv',
    output: 'output.mp4'
}

execFile(handBrake, toSpawnArgs(options), err => {
	console.log('Done');
});
```

# CLI

```bash
$ npm install --global handbrake-bin
```
```bash
$ handbrake --help
```

## Credits

All the credits goes to [https://github.com/HandBrake/HandBrake](https://github.com/HandBrake/HandBrake) and its contributors for their hard work on building [HandBrake](https://handbrake.fr).

## License 

[MIT](LICENSE) © [Rafael Milewski](https://github.com/milewski)
