"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.killStuckProcess = exports.dump = exports.connectionURL = exports.DEVNET = exports.programIds = exports.logTrace = exports.logDebug = exports.logInfo = exports.logError = void 0;
const web3_js_1 = require("@solana/web3.js");
const util_1 = require("util");
const debug_1 = __importDefault(require("debug"));
const tape_1 = __importDefault(require("tape"));
__exportStar(require("./address-labels"), exports);
__exportStar(require("./metadata"), exports);
exports.logError = (0, debug_1.default)('mpl:tm-test:error');
exports.logInfo = (0, debug_1.default)('mpl:tm-test:info');
exports.logDebug = (0, debug_1.default)('mpl:tm-test:debug');
exports.logTrace = (0, debug_1.default)('mpl:tm-test:trace');
exports.programIds = {
    metadata: 'CUYiG7yRSyKrmQpXsRziu4jcV9mG1ttPnz4cDqGubM6k',
    vault: 'CUYiG7yRSyKrmQpXsRziu4jcV9mG1ttPnz4cDqGubM6k',
    auction: 'auctxRXPeJoc4817jDhf4HbjnhEcr1cCXenosMhK5R8',
    metaplex: '58kqoffmdBuj76t5TWqgeLZpVeqeRrz7yKptFWYpzpW8',
};
exports.DEVNET = (0, web3_js_1.clusterApiUrl)('devnet');
exports.connectionURL = exports.DEVNET;
function dump(x) {
    console.log((0, util_1.inspect)(x, { depth: 5 }));
}
exports.dump = dump;
function killStuckProcess() {
    tape_1.default.onFinish(() => process.exit(0));
}
exports.killStuckProcess = killStuckProcess;
//# sourceMappingURL=index.js.map