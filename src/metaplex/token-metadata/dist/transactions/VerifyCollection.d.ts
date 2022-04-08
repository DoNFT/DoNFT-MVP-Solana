import { Borsh, Transaction } from '../../core/dist/src/mpl-core';
import { PublicKey, TransactionCtorFields } from '@solana/web3.js';
export declare class VerifyCollectionArgs extends Borsh.Data {
    static readonly SCHEMA: any;
    instruction: number;
}
declare type VerifyCollectionParams = {
    metadata: PublicKey;
    collectionAuthority: PublicKey;
    collectionMint: PublicKey;
    collectionMetadata: PublicKey;
    collectionMasterEdition: PublicKey;
};
export declare class VerifyCollection extends Transaction {
    constructor(options: TransactionCtorFields, params: VerifyCollectionParams);
}
export {};
