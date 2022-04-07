import { Borsh, Transaction } from '../../core/mpl-core';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionCtorFields,
  TransactionInstruction,
} from '@solana/web3.js';
import { MetadataDataData } from '../accounts/Metadata';
import { MetadataProgram } from '../MetadataProgram';

export class CreateMetadataArgs extends Borsh.Data<{ data: MetadataDataData; isMutable: boolean }> {
  static readonly SCHEMA = new Map([
    ...MetadataDataData.SCHEMA,
    ...CreateMetadataArgs.struct([
      ['instruction', 'u8'],
      ['data', MetadataDataData],
      ['isMutable', 'u8'],
    ]),
  ]);

  instruction = 0;
  data: MetadataDataData;
  isMutable: boolean;
}

type CreateMetadataParams = {
  metadata: PublicKey;
  metadataData: MetadataDataData;
  updateAuthority: PublicKey;
  mint: PublicKey;
  mintAuthority: PublicKey;
};

export class CreateMetadata extends Transaction {
  constructor(options: TransactionCtorFields, params: CreateMetadataParams) {
    super(options);
    const { feePayer } = options;
    const { metadata, metadataData, updateAuthority, mint, mintAuthority } = params;

    const data = CreateMetadataArgs.serialize({
      data: metadataData,
      isMutable: true,
    });

    this.add(
      new TransactionInstruction({
        keys: [
          {
            pubkey: metadata,
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: mint,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: mintAuthority,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: feePayer,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: updateAuthority,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: MetadataProgram.PUBKEY,
        data,
      }),
    );
  }
}
