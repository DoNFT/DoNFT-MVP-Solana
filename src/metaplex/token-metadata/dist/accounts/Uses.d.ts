import { Borsh } from '../../core/dist/src/mpl-core';
import { UseMethod } from '.';
declare type Args = {
    useMethod: UseMethod;
    total: number;
    remaining: number;
};
export declare class Uses extends Borsh.Data<Args> {
    static readonly SCHEMA: any;
    useMethod: UseMethod;
    total: number;
    remaining: number;
    constructor(args: Args);
}
export {};
