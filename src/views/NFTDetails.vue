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

      <div
        v-if="[
          StatusType.Approving,
          StatusType.Sending,
        ].includes(getStatus)" class="loading-container"
      >
        <spinner :size="92" color="#000" />
        <h2>{{ getStatusText(getStatus) }}</h2>
      </div>

    </main>
  </div>
</template>

<script setup>
import { programs } from "@metaplex/js";
import { computed, watch, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { actions } from "@metaplex/js/";
import { PublicKey, Keypair, TransactionInstruction, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { notify } from "@kyvg/vue3-notification";
import statusMixin from "@/mixins/StatusMixin";

import NavBar from "@/components/NavBar/NavBar";
import TokenCard from "@/components/TokenCard/TokenCard";
import Spinner from "@/components/Spinner";

// const nftObj = reactive({
//   receiver_id: "near_testing2.testnet",
//   token_id: [],
//   media: "",
// });

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
  console.log(bundleStorageAccount, "bundle acc");
  const seed = NFTComputedData.value.mint.substr(0, 20);
  const transferAcc = await PublicKey.createWithSeed(
    bundleStorageAccount.publicKey,
    seed,
    CONTRACT_PROGRAM_ID,
  );
  vaultPubkey = transferAcc;

  const TokenMintAccountPubkey1 = (await getSolanaInstance.value.getAccountInfo(transferAcc, "devnet"));
  if (!TokenMintAccountPubkey1) return;

  const bufferTest = Buffer.from(TokenMintAccountPubkey1.data);
  console.log(bufferTest, "BUFFER TEST");

  // counting nfts in bundle data
  // 37 for bundle, 32 per 1 NFT
  const totalNFTsInBundle = Math.floor(((bufferTest.length - 37) / 32));
  const bundleItems = [];
  console.log(totalNFTsInBundle, "totalNFTsInBundle TEST");

  for (let i = 0;  i < totalNFTsInBundle; i++) {
    const bundleItem = bufferTest.subarray(37 + (32 * i), 37 + (32 * (i + 1)));
    console.log(bundleItem, "bundleItem");
    bundleItems.push(new PublicKey(bundleItem));
  }

  const dataForEveryNFT = await Promise.all(bundleItems.map(async (item) => {
    const realMint = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(item, "devnet")).value.data.parsed.info.mint);
    const data = await programs.metadata.Metadata.findByMint(getSolanaInstance.value, realMint);

    return {
      ...data.data,
      pdaMint: item,
    };
  }));

  console.log(dataForEveryNFT, "dataForEveryNFT");

  dataForEveryNFT.forEach((item) => {
    bundleNFTs.value.push(item);
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

    const tokensMintKeys = [];

    bundleNFTs.value.forEach((item) => {
      tokensMintKeys.push(new PublicKey(item.mint));
    });

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

    const TokenAccountParsedMint = await Promise.all(bundleTokenAccountForMints.map(async (item) => {
      console.log(item, "TokenAccountParsedMint");
      const token = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(item[0], "devnet")).value.data.parsed.info.mint);
      console.log(token.toString(), "token");
      return token;
    }));
    console.log(TokenAccountParsedMint, "TokenAccountParsedMint-----");
    
    const TokenMintAccountPubkey1 = (await getSolanaInstance.value.getParsedAccountInfo(BundleTokenAccount1[0], "devnet"));
    const TokenMintAccountPubkey2 = (await getSolanaInstance.value.getParsedAccountInfo(BundleTokenAccount2[0], "devnet"));
    console.log(TokenMintAccountPubkey1, "TokenMintAccountPubkey1");
    console.log(TokenMintAccountPubkey2, "TokenMintAccountPubkey2");

    console.log(bundleNFTs.value[0].pdaMint.toString(), "pdaMint[0] mint");
    const bundleStorageTokenAccountProgram = await PublicKey.findProgramAddress(
      [
        new PublicKey(NFTComputedData.value.mint).toBuffer(),
      ],
      CONTRACT_PROGRAM_ID
    );

    const bundleStorageAccount = Keypair.fromSecretKey(Uint8Array.from([138,133,11,131,247,141,131,185,159,96,109,107,180,236,20,176,63,41,69,76,179,63,201,132,193,76,220,28,143,52,254,215,31,128,60,52,52,212,51,196,74,36,28,61,13,2,210,174,164,102,234,182,74,120,227,153,67,193,173,126,14,38,102,210]));

    const superNFTTokenAccount = await PublicKey.findProgramAddress(
      [
        fromWallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        new PublicKey(NFTComputedData.value.mint).toBuffer()
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    console.log(superNFTTokenAccount[0].toString(), "superNFTTokenAccount[0] mint");

    const burnTx = Token.createBurnInstruction(
      TOKEN_PROGRAM_ID,
      new PublicKey(NFTComputedData.value.mint),
      superNFTTokenAccount[0],
      fromWallet.publicKey,
      [],
      1,
    );

    const bundleTokensSorted = [];

    bundleTokenAccountForMints.forEach((tokenAcc, index) => {
      console.log(bundleNFTs.value, "bundleTokenAccountForMints");
      const pdaForMint = {
        pubkey: bundleNFTs.value[index].pdaMint,
        isSigner: false,
        isWritable: true,
      };

      const nftTokenAcc = {
        pubkey: tokenAcc[0],
        isSigner: false,
        isWritable: true,
      };
      bundleTokensSorted.push(pdaForMint);
      bundleTokensSorted.push(nftTokenAcc);
    });

    const keys =  [
      { pubkey: keyWallet, isSigner: true, isWritable: false },
      { pubkey: vaultPubkey, isSigner: false, isWritable: true },
      { pubkey: superNFTTokenAccount[0], isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: bundleStorageTokenAccountProgram[0], isSigner: false, isWritable: false },
      ...bundleTokensSorted,
    ];

    const bundle_instruction_data = [1, bundleStorageTokenAccountProgram[1]];

    const initEscrowIx = new TransactionInstruction({
      programId: CONTRACT_PROGRAM_ID,
      keys,
      data: Buffer.from(bundle_instruction_data)
    });
    console.log(initEscrowIx, "initEscrowIx.mint");

    store.dispatch("setStatus", StatusType.Sending);
    const tx = new Transaction()
      .add(
        initEscrowIx,
        burnTx,
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

    if (response3.value && response3.value.err === null) {
      store.dispatch("setAllSolanaNFts");
      store.dispatch("setStatus", StatusType.ChoosingParameters);
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
    store.dispatch("setStatus", StatusType.ChoosingParameters);
    notify({
      title: "Transaction status",
      type: "error",
      text: `Something wrong, Error: ${err}`,
      duration: 6000,
    });
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