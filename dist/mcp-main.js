#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_server_1 = require("./mcp-server");
try {
    (0, mcp_server_1.runForemanMcpServer)();
}
catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start codex-foreman-mcp.';
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
}
//# sourceMappingURL=mcp-main.js.map