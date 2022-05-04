<template>
  <div class="page">
    <nav-bar :navigation="getNavigation"/>
    <!-- <div
      v-if="[
        StatusType.Applying,
        StatusType.DeployingToIPFS,
        StatusType.DeployedToIPFS,
        StatusType.Minting
      ].includes(getStatus)"
      class="loading-container"
    >
      <spinner :size="92" color="#000" />
      <h1>{{ statusText }}</h1>
    </div> -->
    <main>
      <h1>Selected NFTs</h1>
      <div
        class="nft-cards"
        v-if="getNFTsData && getNFTsData.length"
      >
        <div
          v-for="item in getNFTsData"
          :key="item.mint"
          class="nft-cards__contract__item nft-cards__contract__item--bundle-data"
        >
          <token-card
            :metadata="item"
            :edit-available="false"
          />
        </div>
      </div>

      <form class="form-nft">
        <uploader
          @selected="setUploadedImg"
        />
        <div class="form-ntf__inputs">
          <input
            type="text"
            placeholder="NFT title"
            class="input form-nft__input"
            v-model="bundleObj.name"
          >
          <textarea
            type="text"
            placeholder="NFT description"
            class="input form-nft__input form-nft__textarea"
            v-model="bundleObj.description"
          />
          <button
            class="main-btn"
            type="submit"
            @click.prevent="bundleNFTs"
          >Bundle NFTs!</button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import {
  actions,
} from "@metaplex/js";
import { reactive, onBeforeMount, ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { Account, PublicKey, SystemProgram, Keypair, TransactionInstruction, Transaction } from "@solana/web3.js";
import { AccountLayout, TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import * as bs58 from "bs58";

import NavBar from "@/components/NavBar/NavBar";
import TokenCard from "@/components/TokenCard/TokenCard";
import Uploader from "@/components/Uploader/Uploader";

const CONTRACT_PROGRAM_ID = new PublicKey(
  "DyPhsdovhyrTktsJS6nrghGvkRoo2FK3ztH1sKKPBDU4",
);

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

const fullAccount = Keypair.fromSecretKey(
  bs58.decode("43tnSS45fGJwAiGdpNyRBATLUqX4BVFMLynVXQzjrBeWrcDEESFyxVPQpG56kWEi3wwiG5apo7j6HsMkc6DVHjU5")
);

const store = useStore();

let nftArray = ref([]);

const bundleObj = reactive({
  name: "NFT token 2 title",
  symbol: "",
  seller_fee_basis_points: 0,
  external_url: "",
  description: "NFT token 2 description",
  image: "",
  properties: {
    files: [
      {
        uri: "",
        type: "image/*"
      }
    ],
    category: "image",
    creators: [
      {
        "address": "8T8zhN7AAR3UBfYhiBvKkzS39ii3AZMARZZz2KjA5UnV",
        "share": 100
      }
    ]
  },
  collection: null,
  use: null
});

// const nftObj = reactive({
//   metadata: {
//     title: "NFT token 2 title",
//     description: "NFT token 2 description",
//     media: null,
//   }
// });

const getNavigation = [{
  text: "Back to Gallery",
  name: "ChooseNFT",
}];

const getAllNFTs = computed({
  get() {
    return store.getters["getAllNFTs"];
  },
});

const getNFTsData = computed({
  get() {
    if (getAllNFTs.value && getAllNFTs.value.length) {
      return nftArray.value.map((urlToken) => {
        const item = getAllNFTs.value.find((nftObj) => nftObj.mint === urlToken);
        return item;
      }).filter(Boolean);
    }
    return [];
  },
});

const getSolanaInstance = computed({
  get() {
    return store.getters["getSolanaInstance"];
  },
});

const getNFTdeployResult = computed({
  get() {
    return store.getters["getNFTdeployResult"];
  },
});

const getSolanaWalletInstance = computed({
  get() {
    return store.getters["getSolanaWalletInstance"];
  },
});

onBeforeMount(() => {
  nftArray.value = sessionStorage.getItem("tokens_id").split(",");

  console.log(CONTRACT_PROGRAM_ID, "store.nftArvault_idray");
});

onMounted(async ()=> {
  // const test = getMintInfo(getSolanaInstance.value, new PublicKey("4syogkhaM4kvLEe2TjwbXRSdhw43YC2aGTACWQdfajWj"));
  
  const test = await PublicKey.findProgramAddress(
    [
      getSolanaWalletInstance.value.publicKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      new PublicKey("4syogkhaM4kvLEe2TjwbXRSdhw43YC2aGTACWQdfajWj").toBuffer(),
    ],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );

  console.log(test[0].toString(), "mounted");
});

const bundleNFTs = async () => {
  console.log("BUNDLE");
  try {
    const connection = getSolanaInstance.value;
    const fromWallet = getSolanaWalletInstance.value;
    // const initializerAccount = new Account(acc_private_key);

    const keyWallet = new PublicKey(getSolanaWalletInstance.value.publicKey.toString());

    console.log(nftArray.value[0], "nftArray.value[0]");
    const token1 = new PublicKey(nftArray.value[0]);
    const token2 = new PublicKey(nftArray.value[1]);
    console.log(keyWallet, "keyWallet");

    const BundleTokenAccount1 = await PublicKey.findProgramAddress(
      [
        fromWallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        token1.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );
    console.log(BundleTokenAccount1[0].toString(), "BundleTokenAccount1");

    const BundleTokenAccount2 = await PublicKey.findProgramAddress(
      [
        fromWallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        token2.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );
    console.log(BundleTokenAccount2[0].toString(), "BundleTokenAccount1");

    const TokenMintAccountPubkey1 = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(BundleTokenAccount1[0], "devnet")).value.data.parsed.info.mint);
    const TokenMintAccountPubkey2 = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(BundleTokenAccount2[0], "devnet")).value.data.parsed.info.mint);
    console.log(TokenMintAccountPubkey1, "TokenMintAccountPubkey1");
    console.log(TokenMintAccountPubkey2, "TokenMintAccountPubkey2");

    const tempTokenAccount1 = new Account();
    const tempTokenAccount2 = new Account();

    // TOKENS STORAGE
    const createTempTokenAccount1 = SystemProgram.createAccount({
      programId: TOKEN_PROGRAM_ID,
      space: AccountLayout.span,
      lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
      fromPubkey: keyWallet,
      newAccountPubkey: tempTokenAccount1.publicKey
    });

    const createTempTokenAccount2 = SystemProgram.createAccount({
      programId: TOKEN_PROGRAM_ID,
      space: AccountLayout.span,
      lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
      fromPubkey: keyWallet,
      newAccountPubkey: tempTokenAccount2.publicKey
    });


    // BUNDLE STORAGE
    // const bundleStorageTokenAccountIx = SystemProgram.createAccountWithSeed({
    //   basePubkey: keyWallet,
    //   fromPubkey: keyWallet,
    //   lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
    //   newAccountPubkey: bundleStorageAccount.publicKey,
    //   programId: TOKEN_PROGRAM_ID,
    //   seed: "payer",
    //   space: 97,
    // });
    // store.dispatch("setStatus", StatusType.DeployingToIPFS);
    await store.dispatch("setDeployToIPFS", bundleObj);
    // store.dispatch("setStatus", StatusType.Approving);
    console.log(getNFTdeployResult, "CREATING");
    const signature = await actions.mintNFT({
      connection,
      wallet: getSolanaWalletInstance.value,
      uri: getNFTdeployResult.value,
      maxSupply: 1,
    });

    const response = await connection.confirmTransaction(signature.txId, "finalized");

    const bundleMintAuthority = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(signature.mint, "devnet")).value.data.parsed.info.mintAuthority);
    console.log(bundleMintAuthority.toString(), "bundleMintAuthority");

    const bundleStorageTokenAccountProgram = await PublicKey.findProgramAddress(
      [
        signature.mint.toBuffer(),
      ],
      CONTRACT_PROGRAM_ID
    );

    const bundleStorageAccount = new Account();

    const setBundleAuthorityTransaction = Token.createSetAuthorityInstruction(
      TOKEN_PROGRAM_ID,
      bundleStorageTokenAccountProgram[0],
      null,
      "MintTokens",
      bundleMintAuthority,
      [],
    );
    console.log(setBundleAuthorityTransaction, "setBundleAuthority");

    const bundleStorageTokenAccountIx = SystemProgram.createAccount({
      programId: CONTRACT_PROGRAM_ID,
      space: 104,
      lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
      fromPubkey: keyWallet,
      newAccountPubkey: bundleStorageAccount.publicKey
    });
    console.log(bundleStorageTokenAccountIx, "bundleStorageTokenAccountIx");


    console.log(bundleStorageTokenAccountIx.keys[0].pubkey.toString(), "bundleStorageTokenAccountIx toString 0");
    console.log(bundleStorageTokenAccountIx.keys[1].pubkey.toString(), "bundleStorageTokenAccountIx toString 0");
    console.log(bundleStorageTokenAccountProgram[0].toString(), "bundleStorageTokenAccountProgram");

    const programs_account_for_mint1 = Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      TokenMintAccountPubkey1,
      tempTokenAccount1.publicKey,
      bundleStorageTokenAccountProgram[0]
    );

    const programs_account_for_mint2 = Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      TokenMintAccountPubkey2,
      tempTokenAccount2.publicKey,
      bundleStorageTokenAccountProgram[0]
    );
    console.log(signature, "signature mint");
    console.log(signature.mint.toString(), "signature mint");

    const superNFTTokenAccount = await PublicKey.findProgramAddress(
      [
        fromWallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        signature.mint.toBuffer()
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );

    console.log(programs_account_for_mint2, "programs_account_for_mint2");
    console.log(programs_account_for_mint1.keys[0].pubkey.toString(), "programs_account_for_mint1");
    console.log(createTempTokenAccount1.keys[1].pubkey.toString(), "createTempTokenAccount1 toString 0");
    console.log(createTempTokenAccount2.keys[1].pubkey.toString(), "createTempTokenAccount2 toString 1");
    // const signatureAuthority = await actions.updateMetadata({
    //   connection,
    //   wallet: getSolanaWalletInstance.value,
    //   editionMint: signature.mint,
    //   newMetadataData: getNFTdeployResult.value,
    //   newUpdateAuthority: new PublicKey(0),
    //   primarySaleHappened: false,
    // });
    console.log(superNFTTokenAccount[0].toString(), "superNFTTokenAccount[0] mint");
    console.log(response, "NFT MINTED[0] mint");

    // const testMint = new PublicKey("8nYT5ntNCnSggDKHCBA8reudGw15uA8TeB8p8Eg3uD8p");


    const keys =  [
      { pubkey: keyWallet, isSigner: true, isWritable: false },
      { pubkey: signature.mint, isSigner: false, isWritable: false },
      { pubkey: superNFTTokenAccount[0], isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: bundleStorageTokenAccountIx.keys[1].pubkey, isSigner: false, isWritable: true },
      { pubkey: BundleTokenAccount1[0], isSigner: false, isWritable: true },
      { pubkey: programs_account_for_mint1.keys[0].pubkey, isSigner: false, isWritable: true },
      { pubkey: BundleTokenAccount2[0], isSigner: false, isWritable: true },
      { pubkey: programs_account_for_mint2.keys[0].pubkey, isSigner: false, isWritable: true },
    ];

    const bundle_instruction_data = [0, bundleStorageTokenAccountProgram[1]];

    // data: [0, 254]
    console.log(bundle_instruction_data, "bundle_instruction_data.mint");

    const initEscrowIx = new TransactionInstruction({
      programId: CONTRACT_PROGRAM_ID,
      keys,
      data: Buffer.from(bundle_instruction_data)
    });
    console.log(initEscrowIx, "initEscrowIx.mint");

    const tx = new Transaction()
      .add(
        createTempTokenAccount1,
        createTempTokenAccount2,
        programs_account_for_mint1,
        programs_account_for_mint2,
        bundleStorageTokenAccountIx,
        initEscrowIx,
        setBundleAuthorityTransaction,
      );
    console.log("tx 1", tx);
    console.log(tempTokenAccount1, "tempTokenAccount1.mint");
    console.log(tempTokenAccount2, "tempTokenAccount2.mint");
    console.log(bundleStorageAccount, "bundleStorageAccount.mint");
    const sendTx = await connection.sendTransaction(tx, [
      fullAccount,
      tempTokenAccount1,
      tempTokenAccount2,
      bundleStorageAccount,
      bundleMintAuthority,
    ], {skipPreflight: false, preflightCommitment: "singleGossip"});
    const response3 = await connection.confirmTransaction(sendTx, "processed");
    console.log("signature 1", sendTx);
    console.log("response3", response3);
    // store.dispatch("setStatus", StatusType.Minting);
    // const response = await connection.confirmTransaction(signature.txId, "processed");
    // console.log("response signature 2", response);

  } catch(err) {
    console.log(err, "ERROR BUNDLE");
  }
};

const setUploadedImg = (src) => {
  bundleObj.image = src; 
};
</script>