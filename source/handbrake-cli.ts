#!/usr/bin/env node

import { spawn } from "child_process";
import { HandbrakeCLIPath } from "./HandBrake";

const input = process.argv.slice(2);

spawn(HandbrakeCLIPath, input, { stdio: 'inherit' }).on('exit', process.exit);
