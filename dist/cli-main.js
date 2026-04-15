#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("./cli");
void (0, cli_1.runCli)(process.argv.slice(2)).then((exitCode) => {
    process.exitCode = exitCode;
});
//# sourceMappingURL=cli-main.js.map