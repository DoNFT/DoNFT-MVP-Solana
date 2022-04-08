"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uses = void 0;
const mpl_core_1 = require("../../core/dist/src/mpl-core");
class Uses extends mpl_core_1.Borsh.Data {
    constructor(args) {
        super(args);
        this.useMethod = args.useMethod;
        this.total = args.total;
        this.remaining = args.remaining;
    }
}
exports.Uses = Uses;
Uses.SCHEMA = Uses.struct([
    ['useMethod', 'u8'],
    ['total', 'u64'],
    ['remaining', 'u64'],
]);
//# sourceMappingURL=Uses.js.map