import { PublicKey } from '@solana/web3.js';
import { Program } from '../core/dist/src/mpl-core';
export declare class MetadataProgram extends Program {
    static readonly PREFIX = "metadata";
    static readonly PUBKEY: PublicKey;
}
