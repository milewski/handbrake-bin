# handbrake-bin

[![Greenkeeper badge](https://badges.greenkeeper.io/Milewski/handbrake-bin.svg)](https://greenkeeper.io/)

```js
const execFile = require('child_process').execFile;
const handBrake = require('handBrake-bin');

execFile(handBrake, ['--input', 'input.mkv', '--output', 'output.mp4'], err => {
	console.log('Done');
});
```
