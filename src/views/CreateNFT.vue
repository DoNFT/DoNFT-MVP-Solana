<template>
  <div class="page">
    <nav-bar :navigation="getNavigation"/>
    <main>
      <h1>Create new NFT</h1>
      <div class="form-nft">
        <uploader @selected="setUploadedImg"/>
        <div class="form-ntf__inputs">
          <span class="form-nft-send__inputs-title">Contract</span>
          <!-- <div class="select-wrap">
            <select v-model="nftObj.contract_id">
              <option v-for="(item, key) in contractsArr" :key="key" :value="item.getter">{{item.name}}</option>
            </select>
          </div> -->
          <span class="form-nft-send__inputs-title">Title</span>
          <input
            type="text"
            placeholder="NFT title"
            class="input form-nft__input"
            v-model="nftObj.name"
          >
          <span class="form-nft-send__inputs-title">Description</span>
          <textarea
            type="text"
            placeholder="NFT description"
            class="input form-nft__input form-nft__textarea"
            v-model="nftObj.description"
          />
          <button
            class="main-btn"
            @click.prevent="createNewNFT"
          >Submit</button>
        </div>
      </div>
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
import { reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import statusMixin from "@/mixins/StatusMixin";
import { notify } from "@kyvg/vue3-notification";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import * as bs58 from "bs58";

import NavBar from "@/components/NavBar/NavBar";
import Uploader from "@/components/Uploader/Uploader";
import Spinner from "@/components/Spinner";

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

const fullAccount = Keypair.fromSecretKey(
  bs58.decode("43tnSS45fGJwAiGdpNyRBATLUqX4BVFMLynVXQzjrBeWrcDEESFyxVPQpG56kWEi3wwiG5apo7j6HsMkc6DVHjU5")
);

const store = useStore();
const router = useRouter();
const { StatusType } = statusMixin();

const nftObj = reactive({
  name: "NFT token 2 title",
  symbol: "test",
  seller_fee_basis_points: 0,
  description: "NFT token 2 description",
  image: "",
  isMutable: 0,
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

const getNavigation = [{
  text: "Back to Gallery",
  name: "ChooseNFT",
}];

const getSolanaWalletInstance = computed({
  get() {
    return store.getters["getSolanaWalletInstance"];
  },
});

const getStatus = computed({
  get() {
    return store.getters["getStatus"];
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

onMounted(async () => {
  console.log(actions, "actions");
  // console.log(bundleStorageTokenAccountProgram[0].toString(), "bundleStorageTokenAccountProgram");
});

const setUploadedImg = (img) => {
  nftObj.image = img; 
};

const createNewNFT = async () => {
  console.log(nftObj, "NFT OBJ");
  try {
    const connection = getSolanaInstance.value;

    store.dispatch("setStatus", StatusType.DeployingToIPFS);
    // await store.dispatch("setDeployToIPFS", nftObj);

    store.dispatch("setStatus", StatusType.Approving);
    console.log(getNFTdeployResult, "CREATING");
    const signature = await actions.mintNFT({
      connection,
      wallet: getSolanaWalletInstance.value,
      uri: "https://ipfs.io/ipfs/QmRxrJnUhpZQSvVArU173DGbjHRyqdUi1vrda3ZHthx4jT",
      maxSupply: 1
    });
    const response = await connection.confirmTransaction(signature.txId, "finalized");
    console.log(signature.mint.toString(), "signature mint");

    const bundleMintAuthority = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(signature.mint, "devnet")).value.data.parsed.info.mintAuthority);
    console.log(bundleMintAuthority.toString(), "bundleMintAuthority");

    const bundleStorageTokenAccountProgram = await PublicKey.findProgramAddress(
      [
        getSolanaWalletInstance.value.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        signature.mint.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );
    const tokenInstance = new Token(getSolanaInstance.value, signature.mint, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, fullAccount);
    console.log(bundleStorageTokenAccountProgram[0].toString(), "bundleStorageTokenAccountProgram");
    console.log(signature.mint.toString(), "signature.mint");
    console.log("signature 1", signature);
    console.log("full 1", fullAccount);
    store.dispatch("setStatus", StatusType.Minting);
    console.log("response signature 2", response);
    console.log("tokenInstance signature 2", tokenInstance);

    const setBundleAuthority = await tokenInstance.setAuthority(
      getSolanaWalletInstance.value.publicKey,
      null,
      "MintTokens",
      signature.mint,
      [fullAccount],
    );

    // const setBundleAuthority = await sendAndConfirmTransaction(
    //   "SetAuthority",
    //   connection2,
    //   new Transaction().add(
    //     Token.createSetAuthorityInstruction(
    //       TOKEN_PROGRAM_ID,
    //       getSolanaWalletInstance.value.publicKey,
    //       null,
    //       "MintTokens",
    //       bundleMintAuthority,
    //       [],
    //     ),
    //   ),
    //   getSolanaWalletInstance.value,
    //   [],
    //   {skipPreflight: false, preflightCommitment: "singleGossip"}
    // );

    // const tx = new Transaction()
    //   .add(
    //     setBundleAuthority,
    //   );

    // const sendTx = await connection.sendTransaction(tx, [bundleStorageTokenAccountProgram[0]], {skipPreflight: false, preflightCommitment: "singleGossip"});
    // console.log(sendTx, "FINAL RESPONSE sendTx");
    // const response3 = await connection.confirmTransaction(sendTx, "processed");

    console.log(setBundleAuthority, "FINAL RESPONSE");
    if (response.value && response.value.err === null) {
      store.dispatch("setStatus", StatusType.ChoosingParameters);
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
    console.log(err, "ERRROR createNewNFT");
    store.dispatch("setStatus", StatusType.ChoosingParameters);
    notify({
      title: "Transaction status",
      type: "error",
      text: `Something wrong, Error: ${err}`,
      duration: 6000,
    });
  }
};

const getStatusText = (status) => {
  const statusData = statusMixin(status);
  console.log(statusData, "statusData");

  return statusData.statusText;
};
</script>
