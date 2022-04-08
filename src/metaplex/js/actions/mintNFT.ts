import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Connection } from '../Connection';
import {
  CreateMasterEdition,
  CreateMetadata,
  Creator,
  MasterEdition,
  Metadata,
  MetadataDataData,
} from '../../token-metadata/dist/mpl-token-metadata';
import { Wallet } from '../wallet';
import { sendTransaction } from './transactions';
import { lookup } from '../utils/metadata';
import { prepareTokenAccountAndMintTxs } from './shared';

export interface MintNFTParams {
  connection: Connection;
  wallet: Wallet;
  uri: string;
  maxSupply?: number;
}

export interface MintNFTResponse {
  txId: string;
  mint: PublicKey;
  metadata: PublicKey;
  edition: PublicKey;
}

    
export const mintNFT = async ({
  connection,
  wallet,
  uri,
  maxSupply,
}: MintNFTParams): Promise<MintNFTResponse> => {
  console.log(connection, wallet, uri, maxSupply, 'mintNFT')
  const { mint, createMintTx, createAssociatedTokenAccountTx, mintToTx } =
    await prepareTokenAccountAndMintTxs(connection, wallet.publicKey);

  const metadataPDA = await Metadata.getPDA(mint.publicKey);
  const editionPDA = await MasterEdition.getPDA(mint.publicKey);
  console.log(metadataPDA.toString(), 'metadataPDA')
  console.log(editionPDA.toString(), 'editionPDA')
  console.log(mint, createMintTx, createAssociatedTokenAccountTx, 'prepareTokenAccountAndMintTxs')

  const {
    name,
    symbol,
    seller_fee_basis_points,
    properties: { creators },
  } = await lookup(uri);

  const creatorsData = creators.reduce<Creator[]>((memo, { address, share }) => {
    const verified = address === wallet.publicKey.toString();
    console.log(memo, address, share, 'verified')

    const creator = new Creator({
      address,
      share,
      verified,
    });
    console.log(creator, 'creator')
    memo = [...memo, creator];

    return memo;
  }, []);

  console.log(creatorsData, 'creatorsData')
  console.log(seller_fee_basis_points, 'seller_fee_basis_points')

  const metadataData = new MetadataDataData({
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: 0,
    creators: creatorsData,
  });

  console.log(metadataData, 'metadataData')

  const createMetadataTx = new CreateMetadata(
    {
      feePayer: wallet.publicKey,
    },
    {
      metadata: metadataPDA,
      metadataData,
      updateAuthority: wallet.publicKey,
      mint: mint.publicKey,
      mintAuthority: wallet.publicKey,
    },
  );

  console.log(createMetadataTx, 'createMetadataTx')

  const masterEditionTx = new CreateMasterEdition(
    { feePayer: wallet.publicKey },
    {
      edition: editionPDA,
      metadata: metadataPDA,
      updateAuthority: wallet.publicKey,
      mint: mint.publicKey,
      mintAuthority: wallet.publicKey,
      maxSupply: maxSupply || maxSupply === 0 ? new BN(maxSupply) : null,
    },
  );
  console.log(masterEditionTx, 'masterEditionTx')

  const txId = await sendTransaction({
    connection,
    signers: [mint],
    txs: [
      createMintTx,
      createMetadataTx,
      createAssociatedTokenAccountTx,
      mintToTx,
      masterEditionTx,
    ],
    wallet,
  });

  console.log(txId, 'tx ID')
  console.log(metadataPDA.toString(), 'metadataPDA.toString()')
  console.log(mint.publicKey.toString(), 'mint.publicKey.toString()')

  return {
    txId,
    mint: mint.publicKey,
    metadata: metadataPDA,
    edition: editionPDA,
  };
};