import { Borsh, StringPublicKey } from '../../core/dist/src/mpl-core';
declare type Args = {
    key: StringPublicKey;
    verified: boolean;
};
export declare class Collection extends Borsh.Data<Args> {
    static readonly SCHEMA: any;
    key: StringPublicKey;
    verified: boolean;
    constructor(args: Args);
}
export {};
