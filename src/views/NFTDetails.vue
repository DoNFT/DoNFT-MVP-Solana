<template>
  <div class="page">
    <nav-bar :navigation="getNav"/>
    <div
      v-if="!NFTComputedData" class="loading-container"
    >
      <spinner :size="92" color="#000" />
    </div>
    <main v-else>
      <div>
        <h1>Details of NFT</h1>
        <div
          class="form-nft-send form-nft__detail-page"
          v-if="NFTComputedData"
        >
          <div class="nft-cards">
            <token-card
              :get-info="true"
              :metadata="NFTComputedData"
              :edit-available="false"
            />
          </div>
          <div
            class="form-nft-send__inputs"
            v-if="getCurrentNFT"
          >
            <span class="form-nft-send__inputs-title">Title</span>
            <input
              type="text"
              placeholder="NFT title"
              class="input form-nft__input"
              :value="getCurrentNFT.name"
            >
            <!-- <span class="form-nft-send__inputs-title">Description</span>
            <textarea
              type="text"
              placeholder="NFT description"
              class="input form-nft__input form-nft__textarea"
              :value="getCurrentNFT.description"
            /> -->
            <div class="form-nft__bottom">
              <button
                class="main-btn"
                @click="burnNFTHandler"
              >Burn NFT</button>
              <button
                class="main-btn"
                :disabled="true"
                @click="changeFormat"
              >Change Format</button>
              <button
                class="main-btn"
                :disabled="true"
                @click="approveNFTHandler"
              >Approve NFT</button>
              <button
                class="main-btn"
                @click="unbundleNFT"
              >Unbundle NFT</button>
              <router-link
                class="main-btn"
                :to="{ name: 'SendNFT', params: { id: NFTComputedData.mint }}"
              >Send NFT page</router-link>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="[
          StatusType.Approving,
          StatusType.Sending,
        ].includes(getStatus)" class="loading-container"
      >
        <spinner :size="92" color="#000" />
        <h2>{{ getStatusText(getStatus) }}</h2>
      </div>

      <div class="bundle-data" v-if="bundleNFTs && bundleNFTs.length">
        <h2>Bundle contain {{ bundleNFTs.length }} NFT</h2>
        <div class="nft-cards__contract-inner">
          <div
            class="nft-cards__contract__item nft-cards__contract__item--bundle-data"
            v-for="item in bundleNFTs"
            :key="item.mint"
          >
            <h5>Token ID: <br> {{ item.mint.slice(0, 8) }} ... {{ item.mint.slice(item.mint.length - 6) }}</h5>
            <token-card
              class="bundle-data__token"
              :is-bundle="true"
              :metadata="item"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { programs } from "@metaplex/js";
import { reactive, computed, watch, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { actions } from "@metaplex/js/";
import { PublicKey, Keypair, TransactionInstruction, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token} from "@solana/spl-token";
import { notify } from "@kyvg/vue3-notification";
import statusMixin from "@/mixins/StatusMixin";

import NavBar from "@/components/NavBar/NavBar";
import TokenCard from "@/components/TokenCard/TokenCard";
import Spinner from "@/components/Spinner";

const nftObj = reactive({
  receiver_id: "near_testing2.testnet",
  token_id: [],
  media: "",
});

let vaultPubkey = ref(null);

const bundleNFTs = ref([]);

const CONTRACT_PROGRAM_ID = new PublicKey(
  "DyPhsdovhyrTktsJS6nrghGvkRoo2FK3ztH1sKKPBDU4",
);

const fullAccount = Keypair.fromSecretKey(Uint8Array.from([168,137,178,118,85,0,219,78,149,104,214,158,185,33,196,108,238,183,141,26,35,60,189,245,167,33,237,202,49,205,192,220,41,251,23,23,113,90,97,50,214,88,148,121,99,2,223,81,55,89,151,23,238,43,56,91,242,238,27,97,242,110,125,214]));
const bundleStorageAccount = Keypair.fromSecretKey(Uint8Array.from([138,133,11,131,247,141,131,185,159,96,109,107,180,236,20,176,63,41,69,76,179,63,201,132,193,76,220,28,143,52,254,215,31,128,60,52,52,212,51,196,74,36,28,61,13,2,210,174,164,102,234,182,74,120,227,153,67,193,173,126,14,38,102,210]));

const router = useRouter();
const store = useStore();
const { StatusType } = statusMixin();

const getAllNFTs = computed({
  get() {
    return store.getters["getAllNFTs"];
  },
});

const getStatus = computed({
  get() {
    return store.getters["getStatus"];
  },
});

const getCurrentNFT = computed({
  get() {
    return store.getters["getCurrentNFT"];
  },
});

const getNav = computed({
  get() {
    return [
      {
        text: "Back to Gallery",
        name: "ChooseNFT",
        params: null,
      },
    ];
  },
});

const getSolanaInstance = computed({
  get() {
    return store.getters["getSolanaInstance"];
  },
});

const getSolanaWalletInstance = computed({
  get() {
    return store.getters["getSolanaWalletInstance"];
  },
});

// const bundleNFTsComputedData = computed({
//   get() {
//     if (NFTComputedData.value) {

//     }
//   },
// });
console.log(nftObj, "nftObj");

const NFTComputedData = computed({
  get() {
    if (getAllNFTs.value && getAllNFTs.value.length) {
      console.log(router, "get router");
      return getAllNFTs.value.find((item) => item.mint === router.currentRoute.value.params.id);
    }
    console.log(getAllNFTs.value, "get all nFTS");
    return null;
  },
});

onMounted(() => {
  console.log(NFTComputedData.value, "ONMOUNTED");
  if (NFTComputedData.value) {
    loadBundleNFTs();
  }
});

watch(() => NFTComputedData.value, () => {
  if (NFTComputedData.value) {
    loadBundleNFTs();
  }
});

const burnNFTHandler = async () => {
  console.log(actions, "burnNFTHandler");

  try {
    const connection = getSolanaInstance.value;
    let mint = new PublicKey(NFTComputedData.value.mint);
    const fromWallet = getSolanaWalletInstance.value;
    const fromTokenAccount = await PublicKey.findProgramAddress(
      [
        getSolanaWalletInstance.value.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    console.log(fromTokenAccount[0].toString(), "fromTokenAccount");

    store.dispatch("setStatus", StatusType.Approving);
    const signature = await actions.burnToken({
      connection: connection,
      wallet: fromWallet,
      token: fromTokenAccount[0],
      mint: mint,
      amount: 1,
      owner: fromWallet.publicKey,
    });


    console.log(signature, "signature");
    store.dispatch("setStatus", StatusType.Sending);
    const response = await connection.confirmTransaction(signature.txId, "processed");
    console.log(response, "response");
    if (response.value && response.value.err === null) {
      store.dispatch("setStatus", StatusType.ChoosingParameters);
      store.dispatch("setAllSolanaNFts");
      router.push({ name: "ChooseNFT"});
      notify({
        title: "Transaction status",
        type: "success",
        text: "NFT successfully burned!",
        duration: 6000,
      });
    }
  } catch(err) {
    console.log(err, "ERRROR burnNFTHandler");
    store.dispatch("setStatus", StatusType.ChoosingParameters);
    notify({
      title: "Transaction status",
      type: "error",
      text: `Something wrong, Error: ${err}`,
      duration: 6000,
    });
  }
};

const loadBundleNFTs = async () => {
  const test = await PublicKey.findProgramAddress(
    [
      new PublicKey(NFTComputedData.value.mint).toBuffer(),
    ],
    CONTRACT_PROGRAM_ID
  );

  console.log(bundleStorageAccount, "bundle acc");
  const seed = NFTComputedData.value.mint.substr(0, 20);
  const transferAcc = await PublicKey.createWithSeed(
    bundleStorageAccount.publicKey,
    seed,
    CONTRACT_PROGRAM_ID,
  );
  vaultPubkey = transferAcc;
  console.log(transferAcc.toString(), "transferAcc");
  const TokenMintAccountPubkey1 = (await getSolanaInstance.value.getAccountInfo(transferAcc, "devnet"));
  const tokenInstance = new Token(getSolanaInstance.value, new PublicKey("J8Zpw8rsdGxFmiBQYRaHZoKodBWjo9fxZ9qj7gFSjgJd"), TOKEN_PROGRAM_ID, fullAccount);
  console.log(test[0].toString(), "mounted");
  console.log(tokenInstance, "tokenInstance");
  console.log(TokenMintAccountPubkey1, "TokenMintAccountPubkey1");
  const bufferTest = Buffer.from(TokenMintAccountPubkey1.data);
  console.log(bufferTest, "bufferTest");
  const BundleItem1 = bufferTest.subarray(37, 69);
  const BundleItem2 = bufferTest.subarray(69, 101);
  const bundleSize = bufferTest.readUintLE(33, 4);
  const string1 = new PublicKey(BundleItem1);
  const string2 = new PublicKey(BundleItem2);
  console.log(string1.toString(), "string1 1");
  console.log(string2.toString(), "string2 1");
  const realMint1 = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(string1, "devnet")).value.data.parsed.info.mint);
  const realMint2 = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(string2, "devnet")).value.data.parsed.info.mint);
  console.log(realMint1, "realMint2 1");
  const data1 = await programs.metadata.Metadata.findByMint(getSolanaInstance.value, realMint1);
  const data2 = await programs.metadata.Metadata.findByMint(getSolanaInstance.value, realMint2);
  console.log(data1.data, "data1 1");
  console.log(data2.data, "data2 1");
  console.log(bundleSize, "BundleSize 3");
  console.log(bundleNFTs.value, "bundleNFTs.value 1");
  bundleNFTs.value.push({
    ...data1.data,
    pdaMint: string1,
  });
  bundleNFTs.value.push({
    ...data2.data,
    pdaMint: string2,
  });
  console.log(bundleNFTs.value, "bundleNFTs.value 2");
};

const approveNFTHandler = () => {
  console.log("approveNFTHandler");
};

const unbundleNFT = async () => {
  console.log("unbundleNFT");
  try {
    const connection = getSolanaInstance.value;

    const fromWallet = getSolanaWalletInstance.value;
    // const initializerAccount = new Account(acc_private_key);

    const keyWallet = new PublicKey(getSolanaWalletInstance.value.publicKey.toString());

    console.log(bundleNFTs.value[0].mint, "nftArray.value[0]");
    const token1 = new PublicKey(bundleNFTs.value[0].mint);
    const token2 = new PublicKey(bundleNFTs.value[1].mint);
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

    const vaultPDA = await PublicKey.findProgramAddress(
      [
        fullAccount.publicKey.toBuffer(),
      ],
      CONTRACT_PROGRAM_ID
    );
    console.log(vaultPDA[0].toString(), "vaultPDA");

    const TokenMintAccountPubkey1 = (await getSolanaInstance.value.getParsedAccountInfo(BundleTokenAccount1[0], "devnet"));
    const TokenMintAccountPubkey2 = (await getSolanaInstance.value.getParsedAccountInfo(BundleTokenAccount2[0], "devnet"));
    console.log(TokenMintAccountPubkey1, "TokenMintAccountPubkey1");
    console.log(TokenMintAccountPubkey2, "TokenMintAccountPubkey2");

    // const tempTokenAccount1 = new Account();
    // const tempTokenAccount2 = new Account();

    // // TOKENS STORAGE
    // const createTempTokenAccount1 = SystemProgram.createAccount({
    //   programId: TOKEN_PROGRAM_ID,
    //   space: AccountLayout.span,
    //   lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
    //   fromPubkey: keyWallet,
    //   newAccountPubkey: tempTokenAccount1.publicKey
    // });

    // const createTempTokenAccount2 = SystemProgram.createAccount({
    //   programId: TOKEN_PROGRAM_ID,
    //   space: AccountLayout.span,
    //   lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
    //   fromPubkey: keyWallet,
    //   newAccountPubkey: tempTokenAccount2.publicKey
    // });


    // store.dispatch("setStatus", StatusType.DeployingToIPFS);

    console.log(bundleNFTs.value[0].pdaMint.toString(), "pdaMint[0] mint");
    const bundleStorageTokenAccountProgram = await PublicKey.findProgramAddress(
      [
        new PublicKey(NFTComputedData.value.mint).toBuffer(),
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

    // console.log(transferAcc, "transferAcc");

    // BUNDLE STORAGE
    console.log(bundleStorageTokenAccountProgram[0], "bundleStorageTokenAccountProgram");
    console.log(bundleStorageAccount, "bundleStorageAccount");
    console.log(bundleSeedToString, "-----bundleSeedToString-----");
    console.log(bundleStorageAccountKey[0].toString(), "-----bundleStorageAccountKey-----");
    console.log(NFTComputedData.value.mint, "signature mint");

    const superNFTTokenAccount = await PublicKey.findProgramAddress(
      [
        fromWallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        new PublicKey(NFTComputedData.value.mint).toBuffer()
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // console.log(programs_account_for_mint2, "programs_account_for_mint2");
    // console.log(programs_account_for_mint1.keys[0].pubkey.toString(), "programs_account_for_mint1");
    // console.log(createTempTokenAccount1.keys[1].pubkey.toString(), "createTempTokenAccount1 toString 0");
    // console.log(createTempTokenAccount2.keys[1].pubkey.toString(), "createTempTokenAccount2 toString 1");
    // const signatureAuthority = await actions.updateMetadata({
    //   connection,
    //   wallet: getSolanaWalletInstance.value,
    //   editionMint: signature.mint,
    //   newMetadataData: getNFTdeployResult.value,
    //   newUpdateAuthority: new PublicKey(0),
    //   primarySaleHappened: false,
    // });
    console.log(superNFTTokenAccount[0].toString(), "superNFTTokenAccount[0] mint");
    // console.log(response, "NFT MINTED[0] mint");

    // const testMint = new PublicKey("8nYT5ntNCnSggDKHCBA8reudGw15uA8TeB8p8Eg3uD8p");

    //tsuper bundle
    // const keys =  [
    //   fullAccount.publicKey,
    //   transferAcc,
    //   superNFTTokenAccount[0],
    //   TOKEN_PROGRAM_ID,
    //   vaultPDA[0],
    //   BundleTokenAccount1[0],
    //   bundleNFTs.value[0].pdaMint,
    //   BundleTokenAccount2[0],
    //   bundleNFTs.value[1].pdaMint,
    // ]

    const keys =  [
      { pubkey: keyWallet, isSigner: true, isWritable: false },
      { pubkey: vaultPubkey, isSigner: false, isWritable: true },
      { pubkey: superNFTTokenAccount[0], isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: bundleStorageTokenAccountProgram[0], isSigner: false, isWritable: false },
      { pubkey: bundleNFTs.value[0].pdaMint, isSigner: false, isWritable: true },
      { pubkey: BundleTokenAccount1[0], isSigner: false, isWritable: true },
      { pubkey: bundleNFTs.value[1].pdaMint, isSigner: false, isWritable: true },
      { pubkey: BundleTokenAccount2[0], isSigner: false, isWritable: true },
    ];

    const bundle_instruction_data = [1, bundleStorageTokenAccountProgram[1]];

    // // data: [0, 254]
    console.log(bundle_instruction_data, "bundle_instruction_data.mint");

    const initEscrowIx = new TransactionInstruction({
      programId: CONTRACT_PROGRAM_ID,
      keys,
      data: Buffer.from(bundle_instruction_data)
    });
    console.log(initEscrowIx, "initEscrowIx.mint");

    const tx = new Transaction()
      .add(
        initEscrowIx,
      );
    console.log("tx 1", tx);
    console.log(bundleStorageAccount.publicKey.toString(), "bundleStorageAccount.mint");
    const sendTx = await connection.sendTransaction(tx, [
      fullAccount,
    ], {skipPreflight: false, preflightCommitment: "singleGossip"});
    const response3 = await connection.confirmTransaction(sendTx, "processed");
    console.log("signature 1", sendTx);
    console.log("response3", response3);
    store.dispatch("setStatus", StatusType.Minting);
  } catch(err) {
    console.log(err, "ERROR BUNDLE");
  }
};

const changeFormat = () => {
  console.log("changeFormat");
};

const getStatusText = (status) => {
  const statusData = statusMixin(status);
  console.log(statusData, "statusData");

  return statusData.statusText;
};
</script>

<style scoped lang="scss">
.bundle-data {
  margin-top: 50px;

  h2 {
    margin-bottom: 40px;
  }
}

.bundle-data__token {
  margin-right: 15px;
}
</style>