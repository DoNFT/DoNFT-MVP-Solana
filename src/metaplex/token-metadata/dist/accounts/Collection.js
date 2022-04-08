"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const mpl_core_1 = require("../../core/dist/src/mpl-core");
class Collection extends mpl_core_1.Borsh.Data {
    constructor(args) {
        super(args);
        this.key = args.key;
        this.verified = args.verified;
    }
}
exports.Collection = Collection;
Collection.SCHEMA = Collection.struct([
    ['verified', 'u8'],
    ['key', 'pubkeyAsString'],
]);
//# sourceMappingURL=Collection.js.map