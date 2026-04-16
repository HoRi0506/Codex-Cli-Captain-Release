"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOREMAN_PACKAGE_VERSION = exports.FOREMAN_PACKAGE_NAME = void 0;
const package_json_1 = __importDefault(require("../package.json"));
exports.FOREMAN_PACKAGE_NAME = package_json_1.default.name;
exports.FOREMAN_PACKAGE_VERSION = package_json_1.default.version;
//# sourceMappingURL=package-metadata.js.map