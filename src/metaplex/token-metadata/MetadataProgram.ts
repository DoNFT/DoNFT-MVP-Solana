import { PublicKey } from '@solana/web3.js';
import { Program, config } from '../core/mpl-core';

export class MetadataProgram extends Program {
  static readonly PREFIX = 'metadata';
  static readonly PUBKEY = new PublicKey(config.programs.metadata);
}
