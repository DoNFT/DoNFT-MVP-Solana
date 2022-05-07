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

import NavBar from "@/components/NavBar/NavBar";
import TokenCard from "@/components/TokenCard/TokenCard";
import UploaderComp from "@/components/Uploader/UploaderComp";

const CONTRACT_PROGRAM_ID = new PublicKey(
  "DyPhsdovhyrTktsJS6nrghGvkRoo2FK3ztH1sKKPBDU4",
);

const fullAccount = Keypair.fromSecretKey(Uint8Array.from([168,137,178,118,85,0,219,78,149,104,214,158,185,33,196,108,238,183,141,26,35,60,189,245,167,33,237,202,49,205,192,220,41,251,23,23,113,90,97,50,214,88,148,121,99,2,223,81,55,89,151,23,238,43,56,91,242,238,27,97,242,110,125,214]));

const store = useStore();
const router = useRouter();

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
        "address": "3psnJUFeJ4QyHwKjbfycFKrFap9FxHJehAYmMc3ZRBWV",
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
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

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
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    console.log(BundleTokenAccount1[0].toString(), "BundleTokenAccount1");

    const BundleTokenAccount2 = await PublicKey.findProgramAddress(
      [
        fromWallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        token2.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
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


    // store.dispatch("setStatus", StatusType.DeployingToIPFS);
    await store.dispatch("setDeployToIPFS", bundleObj);
    // store.dispatch("setStatus", StatusType.Approving);
    //"https://ipfs.io/ipfs/Qmb8yTr9CRhFzTwasPCgXAtLHrfhmNw6i4raJZHr82hzUs"

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

    const uintSeed = Uint8Array.from([138,133,11,131,247,141,131,185,159,96,109,107,180,236,20,176,63,41,69,76,179,63,201,132,193,76,220,28,143,52,254,215,31,128,60,52,52,212,51,196,74,36,28,61,13,2,210,174,164,102,234,182,74,120,227,153,67,193,173,126,14,38,102,210]);
    console.log(uintSeed, "uint");
    const bundleSeedToString = bundleStorageTokenAccountProgram[0].toString();
    const bundleStorageAccount = Keypair.fromSecretKey(uintSeed);
    const bundleStorageAccountKey = await PublicKey.findProgramAddress(
      [
        bundleStorageAccount.publicKey.toBuffer(),
      ],
      CONTRACT_PROGRAM_ID
    );

    const seed = signature.mint.toString().substr(0, 20);
    console.log(seed, "----seed----");
    const transferAcc = await PublicKey.createWithSeed(
      bundleStorageAccount.publicKey,
      seed,
      CONTRACT_PROGRAM_ID,
    );

    // console.log(transferAcc, "transferAcc");

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
    console.log(bundleStorageTokenAccountProgram[0], "bundleStorageTokenAccountProgram");
    console.log(bundleStorageAccount, "bundleStorageAccount");
    console.log(bundleSeedToString, "-----bundleSeedToString-----");
    console.log(bundleStorageAccountKey[0].toString(), "-----bundleStorageAccountKey-----");
    // console.log(transferAcc.toString(), "transferAcc");
    // const greetedAccount = await getSolanaInstance.value.getAccountInfo(transferAcc);
    // console.log(greetedAccount, "greetedAccount");
    const bundleStorageTokenAccountIx = SystemProgram.createAccountWithSeed({
      basePubkey: bundleStorageAccount.publicKey,
      fromPubkey: keyWallet,
      lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
      newAccountPubkey: transferAcc,
      programId: CONTRACT_PROGRAM_ID,
      seed,
      space: 104,
    });

    // const bundleStorageTokenAccountIx = SystemProgram.createAccount({
    //   programId: CONTRACT_PROGRAM_ID,
    //   space: 104,
    //   lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
    //   fromPubkey: keyWallet,
    //   newAccountPubkey: bundleStorageTokenAccountProgram[0]
    // });
    console.log(bundleStorageTokenAccountIx, "bundleStorageTokenAccountIx");


    console.log(bundleStorageTokenAccountIx.keys[0].pubkey.toString(), "bundleStorageTokenAccountIx toString 0");
    console.log(bundleStorageTokenAccountIx.keys[1].pubkey.toString(), "bundleStorageTokenAccountIx toString 1");
    // console.log(bundleStorageTokenAccountIx.keys[2].pubkey.toString(), "bundleStorageTokenAccountIx toString 2");

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
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log(programs_account_for_mint2.keys[0].pubkey.toString(), "programs_account_for_mint2");
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


    // const keys =  [
    //   ...,
    //   ...,
    //   EvqYXuLHVRT9wzHiim15fq9mbq2AZXta2wjQqRNZJ33x,
    //   ...,
    //   8Z65gyotmRG6eR1yMuShQ5sphTntwdCn71zUMgV4ZwXp,
    //   2fyJiyztdqSh8AnxM33PJ5nhTJhyExU4FkDxv6niesjP,
    //   3WpGj3GJRJJDvXaNnBrRioGKeyHU4yun3h7Sb4NbJMgy,
    //   8RnsEzYCHDWR3xtgEUEm7ZB3qMaxqeSKVRB2LLe7wXsJ,
    //   2m83YkVzeFEW43R5AJA8bpha7MZ1BdhUKjkPx2y1RBYs
    // ]
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
      );
    console.log("tx 1", tx);
    console.log(tempTokenAccount1, "tempTokenAccount1.mint");
    console.log(tempTokenAccount2, "tempTokenAccount2.mint");
    console.log(bundleStorageAccount.publicKey.toString(), "bundleStorageAccount.mint");
    const sendTx = await connection.sendTransaction(tx, [
      fullAccount,
      tempTokenAccount1,
      tempTokenAccount2,
      bundleStorageAccount,
    ], {skipPreflight: false, preflightCommitment: "singleGossip"});
    const response3 = await connection.confirmTransaction(sendTx, "processed");
    console.log("signature 1", sendTx);
    console.log("response3", response3);
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
  } catch(err) {
    console.log(err, "ERROR BUNDLE");
  }
};

const setUploadedImg = (src) => {
  bundleObj.image = src; 
};
</script>