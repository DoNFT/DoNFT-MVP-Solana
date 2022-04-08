"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataProgram = void 0;
const web3_js_1 = require("@solana/web3.js");
const mpl_core_1 = require("../core/dist/src/mpl-core");
class MetadataProgram extends mpl_core_1.Program {
}
exports.MetadataProgram = MetadataProgram;
MetadataProgram.PREFIX = 'metadata';
MetadataProgram.PUBKEY = new web3_js_1.PublicKey(mpl_core_1.config.programs.metadata);
//# sourceMappingURL=MetadataProgram.js.map