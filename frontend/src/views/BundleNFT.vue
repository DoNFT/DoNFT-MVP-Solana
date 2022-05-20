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
        <uploader-comp
          @selected="setUploadedImg"
        />
        <div class="form-ntf__inputs">
          <input
            type="text"
            placeholder="NFT title"
            class="input form-nft__input"
            v-model="bundleObj.name"
          >
          <!-- <textarea
            type="text"
            placeholder="NFT description"
            class="input form-nft__input form-nft__textarea"
            v-model="bundleObj.description"
          /> -->
          <button
            class="main-btn"
            type="submit"
            @click.prevent="bundleNFTs"
          >Bundle NFTs!</button>
        </div>
      </form>

      <div
        v-if="[
          StatusType.Approving,
          StatusType.Sending,
          StatusType.Minting,
        ].includes(getStatus)" class="loading-container"
      >
        <spinner :size="92" color="#000" />
        <h2>{{ getStatusText(getStatus) }}</h2>
      </div>
    </main>
  </div>
</template>

<script setup>
import {
  actions,
} from "@metaplex/js";
import { reactive, onBeforeMount, ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { notify } from "@kyvg/vue3-notification";
import { Account, PublicKey, SystemProgram, Keypair, TransactionInstruction, Transaction } from "@solana/web3.js";
import { AccountLayout, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import statusMixin from "@/mixins/StatusMixin";

import NavBar from "@/components/NavBar/NavBar";
import TokenCard from "@/components/TokenCard/TokenCard";
import UploaderComp from "@/components/Uploader/UploaderComp";
import Spinner from "@/components/Spinner";

const CONTRACT_PROGRAM_ID = new PublicKey(
  "DyPhsdovhyrTktsJS6nrghGvkRoo2FK3ztH1sKKPBDU4",
);

const fullAccount = Keypair.fromSecretKey(Uint8Array.from([168,137,178,118,85,0,219,78,149,104,214,158,185,33,196,108,238,183,141,26,35,60,189,245,167,33,237,202,49,205,192,220,41,251,23,23,113,90,97,50,214,88,148,121,99,2,223,81,55,89,151,23,238,43,56,91,242,238,27,97,242,110,125,214]));

const { StatusType } = statusMixin();
const store = useStore();
const router = useRouter();

let nftArray = ref([]);

const bundleObj = reactive({
  name: "NFT token 2 title",
  symbol: "bundle",
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
    creators: []
  },
  collection: null,
  use: null
});

const getStatus = computed({
  get() {
    return store.getters["getStatus"];
  },
});

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
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // creating nft, require wallet key of creator
  const defaultCreator = {
    "address": getSolanaWalletInstance.value.publicKey.toString(),
    "share": 100
  };
  bundleObj.properties.creators.push(defaultCreator);
  console.log(test[0].toString(), "mounted");
});

// "https://ipfs.io/ipfs/QmVUguweEjtDThd8ztRY4B2twczFZ7Q7DCXrTypJDuz44g"

const bundleNFTs = async () => {
  console.log("BUNDLE");
  try {
    const connection = getSolanaInstance.value;
    const fromWallet = getSolanaWalletInstance.value;
    // const initializerAccount = new Account(acc_private_key);

    const keyWallet = new PublicKey(getSolanaWalletInstance.value.publicKey.toString());

    const tokensMintKeys = [];

    nftArray.value.forEach((item) => {
      tokensMintKeys.push(new PublicKey(item));
    });

    console.log(tokensMintKeys, "tokensMintKeys");

    console.log(nftArray.value[0], "nftArray.value[0]");
    console.log(keyWallet, "keyWallet");

    // BundleTokenAccounts (1, 2, 3 ...)
    const bundleTokenAccountForMints = await Promise.all(tokensMintKeys.map(async (item) => {
      const token = await PublicKey.findProgramAddress(
        [
          fromWallet.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          item.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      return token;
    }));

    const TokenAccountParsedMint = await Promise.all(bundleTokenAccountForMints.map(async (item) => {
      console.log(item, "TokenAccountParsedMint");
      const token = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(item[0], "devnet")).value.data.parsed.info.mint);
      console.log(token.toString(), "token");
      return token;
    }));
    console.log(TokenAccountParsedMint, "TokenAccountParsedMint-----");
    
    const tempTokenAccounts = [];

    for (let i = 0; i < TokenAccountParsedMint.length; i++) {
      tempTokenAccounts.push(new Account);
    }

    console.log(tempTokenAccounts, "tempTokenAccounts------");

    const tempTokenAccountInstruction = await Promise.all(tempTokenAccounts.map(async (item, index) => {
      console.log(tempTokenAccounts[index].publicKey, index, "tempTokenAccounts[index].publicKey");
      const instruction = SystemProgram.createAccount({
        programId: TOKEN_PROGRAM_ID,
        space: AccountLayout.span,
        lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
        fromPubkey: keyWallet,
        newAccountPubkey: tempTokenAccounts[index].publicKey
      });

      console.log(instruction, index, "tempTokenAccounts");
      return instruction;
    }));
    console.log(tempTokenAccountInstruction, "tempTokenAccountInstruction------");

    // TOKENS STORAGE
    store.dispatch("setStatus", StatusType.DeployingToIPFS);

    await store.dispatch("setDeployToIPFS", { isImageDeployed: false, meta: bundleObj });
    console.log(getNFTdeployResult, "CREATING");
    // Block of minting BUNDLE NFT
    const signature = await actions.mintNFT({
      connection,
      wallet: getSolanaWalletInstance.value,
      uri: getNFTdeployResult.value,
      maxSupply: 1,
    });

    store.dispatch("setStatus", StatusType.Minting);

    await connection.confirmTransaction(signature.txId, "finalized");

    // token account of bundle nft
    const bundleStorageTokenAccountProgram = await PublicKey.findProgramAddress(
      [
        signature.mint.toBuffer(),
      ],
      CONTRACT_PROGRAM_ID
    );

    // account for creating program with seed
    const bundleStorageAccount = Keypair.fromSecretKey(Uint8Array.from([138,133,11,131,247,141,131,185,159,96,109,107,180,236,20,176,63,41,69,76,179,63,201,132,193,76,220,28,143,52,254,215,31,128,60,52,52,212,51,196,74,36,28,61,13,2,210,174,164,102,234,182,74,120,227,153,67,193,173,126,14,38,102,210]));
    
    // creating account with seed
    // seed gonna help us to find bundle inner NFT later
    const seed = signature.mint.toString().substr(0, 20);

    const transferAcc = await PublicKey.createWithSeed(
      bundleStorageAccount.publicKey,
      seed,
      CONTRACT_PROGRAM_ID,
    );

    store.dispatch("setStatus", StatusType.Approving);
    // todo: SET AUTHORITY for BUNDLE NFT, isMutable property in metadata of token

    // const bundleMintAuthority = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(signature.mint, "devnet")).value.data.parsed.info.mintAuthority);
    // const setBundleAuthorityTransaction = Token.createSetAuthorityInstruction(
    //   TOKEN_PROGRAM_ID,
    //   bundleStorageTokenAccountProgram[0],
    //   null,
    //   "MintTokens",
    //   bundleMintAuthority,
    //   [],
    // );
    // console.log(setBundleAuthorityTransaction, "setBundleAuthority");

    // BUNDLE STORAGE

    const bundleStorageTokenAccountIx = SystemProgram.createAccountWithSeed({
      basePubkey: bundleStorageAccount.publicKey,
      fromPubkey: keyWallet,
      lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
      newAccountPubkey: transferAcc,
      programId: CONTRACT_PROGRAM_ID,
      seed,
      space: 1 + 32 + 4 + (32 * TokenAccountParsedMint.length),
    });

    console.log(bundleStorageTokenAccountIx, "bundleStorageTokenAccountIx");


    console.log(bundleStorageTokenAccountIx.keys[0].pubkey.toString(), "bundleStorageTokenAccountIx toString 0");
    console.log(bundleStorageTokenAccountIx.keys[1].pubkey.toString(), "bundleStorageTokenAccountIx toString 1");
    // console.log(bundleStorageTokenAccountIx.keys[2].pubkey.toString(), "bundleStorageTokenAccountIx toString 2");


    // creating program accounts for every inner NFT of bundle
    const programsAccountForMint = await Promise.all(tempTokenAccounts.map(async (item, index) => {
      console.log(tempTokenAccounts[index].publicKey, index, "tempTokenAccounts[index].publicKey");
      const instruction = Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        TokenAccountParsedMint[index],
        tempTokenAccounts[index].publicKey,
        bundleStorageTokenAccountProgram[0]
      );

      console.log(instruction, "tempTokenAccounts");
      return instruction;
    }));

    console.log(programsAccountForMint, "programsAccountForMint-----");

    console.log(signature, "signature mint");
    console.log(signature.mint.toString(), "signature mint");

    const superNFTTokenAccount = await PublicKey.findProgramAddress(
      [
        fromWallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        signature.mint.toBuffer()
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const bundleTokensSorted = [];

    bundleTokenAccountForMints.forEach((tokenAcc, index) => {
      const nftTokenAcc = {
        pubkey: tokenAcc[0],
        isSigner: false,
        isWritable: true,
      };

      const pdaForMint = {
        pubkey: programsAccountForMint[index].keys[0].pubkey,
        isSigner: false,
        isWritable: true,
      };

      bundleTokensSorted.push(nftTokenAcc);
      bundleTokensSorted.push(pdaForMint);
    });

    console.log(bundleTokensSorted, "bundleTokensSorted------");

    const keys =  [
      { pubkey: keyWallet, isSigner: true, isWritable: false },
      { pubkey: signature.mint, isSigner: false, isWritable: false },
      { pubkey: superNFTTokenAccount[0], isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: bundleStorageTokenAccountIx.keys[1].pubkey, isSigner: false, isWritable: true },
      ...bundleTokensSorted
    ];

    console.log(keys, "keys------");
    const bundle_instruction_data = [0, bundleStorageTokenAccountProgram[1]];

    // data: [0, 254]
    console.log(bundle_instruction_data, "bundle_instruction_data.mint");

    const initEscrowIx = new TransactionInstruction({
      programId: CONTRACT_PROGRAM_ID,
      keys,
      data: Buffer.from(bundle_instruction_data)
    });
    console.log(initEscrowIx, "initEscrowIx.mint");

    store.dispatch("setStatus", StatusType.Sending);
    const tx = new Transaction()
      .add(
        ...tempTokenAccountInstruction,
        ...programsAccountForMint,
      );
    console.log("tx 1", tx);
    console.log(bundleStorageAccount.publicKey.toString(), "bundleStorageAccount.mint");
    const sendTx = await connection.sendTransaction(tx, [
      fullAccount,
      ...tempTokenAccounts,
    ], {skipPreflight: false, preflightCommitment: "singleGossip"});

    const response3 = await connection.confirmTransaction(sendTx, "finalized");
    console.log("response3", response3);
    console.log("signature 1", sendTx);
    const tx2 = new Transaction()
      .add(
        bundleStorageTokenAccountIx,
        initEscrowIx,
      );

    const sendTx2 = await connection.sendTransaction(tx2, [
      fullAccount,
      bundleStorageAccount,
    ], {skipPreflight: false, preflightCommitment: "singleGossip"});

    const response4 = await connection.confirmTransaction(sendTx2, "processed");
    console.log("response4444442", response4);
    console.log("signature 2", sendTx2);
    // store.dispatch("setStatus", StatusType.Minting);
    // const response = await connection.confirmTransaction(signature.txId, "processed");
    // console.log("response signature 2", response);

    if (response3.value && response3.value.err === null) {
      store.dispatch("setAllSolanaNFts");
      router.push({ name: "ChooseNFT"});
      notify({
        title: "Transaction status",
        type: "success",
        text: "NFT successfully Minted!",
        duration: 6000,
      });
    }
    store.dispatch("setStatus", StatusType.ChoosingParameters);
  } catch(err) {
    console.log(err, "ERROR BUNDLE");
    store.dispatch("setStatus", StatusType.ChoosingParameters);
    notify({
      title: "Transaction status",
      type: "error",
      text: `Something wrong, Error: ${err}`,
      duration: 6000,
    });
  }
};

const setUploadedImg = (src) => {
  bundleObj.image = src; 
};

const getStatusText = (status) => {
  const statusData = statusMixin(status);
  console.log(statusData, "statusData");

  return statusData.statusText;
};
</script>