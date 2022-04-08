"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const mpl_token_metadata_1 = require("../src/mpl-token-metadata");
const utils_1 = require("./utils");
const amman_1 = require("@metaplex-foundation/amman");
const web3_js_1 = require("@solana/web3.js");
const actions_1 = require("./actions");
const accounts_1 = require("../src/accounts");
(0, utils_1.killStuckProcess)();
function createCollection(connection, transactionHandler, payer) {
    return __awaiter(this, void 0, void 0, function* () {
        const initMetadataData = new mpl_token_metadata_1.DataV2({
            uri: utils_1.URI,
            name: utils_1.NAME,
            symbol: utils_1.SYMBOL,
            sellerFeeBasisPoints: utils_1.SELLER_FEE_BASIS_POINTS,
            creators: null,
            collection: null,
            uses: null,
        });
        return yield (0, actions_1.createMasterEdition)(connection, transactionHandler, payer, initMetadataData, 0);
    });
}
(0, tape_1.default)('verify-collection', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const payer = web3_js_1.Keypair.generate();
    const connection = new web3_js_1.Connection(utils_1.connectionURL, 'confirmed');
    const transactionHandler = new amman_1.PayerTransactionHandler(connection, payer);
    yield (0, amman_1.airdrop)(connection, payer.publicKey, 2);
    const collectionNft = yield createCollection(connection, transactionHandler, payer);
    const initMetadataData = new mpl_token_metadata_1.DataV2({
        uri: utils_1.URI,
        name: utils_1.NAME,
        symbol: utils_1.SYMBOL,
        sellerFeeBasisPoints: utils_1.SELLER_FEE_BASIS_POINTS,
        creators: null,
        collection: new accounts_1.Collection({ key: collectionNft.mint.publicKey.toBase58(), verified: false }),
        uses: null,
    });
    const collectionMemberNft = yield (0, actions_1.createMasterEdition)(connection, transactionHandler, payer, initMetadataData, 0);
    console.log('collectionMemberNft', collectionMemberNft.metadata.toBase58());
    const updatedMetadataBeforeVerification = yield (0, utils_1.getMetadataData)(connection, collectionMemberNft.metadata);
    t.ok(updatedMetadataBeforeVerification.collection, 'collection should be not null');
    t.not(updatedMetadataBeforeVerification.collection.verified, 'collection should be not be verified');
    const collectionVerifyCollectionTransaction = new mpl_token_metadata_1.VerifyCollection({ feePayer: payer.publicKey }, {
        metadata: collectionMemberNft.metadata,
        collectionAuthority: payer.publicKey,
        collectionMint: collectionNft.mint.publicKey,
        collectionMetadata: collectionNft.metadata,
        collectionMasterEdition: collectionNft.masterEditionPubkey,
    });
    yield transactionHandler.sendAndConfirmTransaction(collectionVerifyCollectionTransaction, [payer], { skipPreflight: true });
    const updatedMetadataAfterVerification = yield (0, utils_1.getMetadataData)(connection, collectionMemberNft.metadata);
    t.ok(updatedMetadataAfterVerification.collection, 'collection should be not null');
    t.ok(updatedMetadataAfterVerification.collection.verified, 'collection should be verified');
}));
//# sourceMappingURL=create-and-verify-collection.test.js.map