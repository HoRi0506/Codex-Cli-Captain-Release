#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codex_launcher_1 = require("./codex-launcher");
void (0, codex_launcher_1.runCodexLauncher)(process.argv.slice(2)).then((exitCode) => {
    process.exitCode = exitCode;
});
//# sourceMappingURL=codex-launcher-main.js.map