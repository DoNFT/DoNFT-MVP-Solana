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
            <span class="form-nft-send__inputs-title">Description</span>
            <textarea
              type="text"
              placeholder="NFT description"
              class="input form-nft__input form-nft__textarea"
              :value="getCurrentNFT.description"
            />
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
                :disabled="true"
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

      <!-- <div class="bundle-data" v-if="bundleNFTsComputedData">
        <div class="nft-cards__contract-inner">
          <div
            class="nft-cards__contract__item nft-cards__contract__item--bundle-data"
            v-for="item in bundleNFTsComputedData"
            :key="item.token_id"
          >
            <h5>Token ID: <br> {{ item.token_id }}</h5>
            <token-card
              class="bundle-data__token"
              :is-bundle="true"
              :metadata="item"
            />
          </div>
        </div>
      </div> -->
    </main>
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { PublicKey } from "@solana/web3.js";
import { actions } from "@metaplex/js/";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
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

const burnNFTHandler = async () => {
  console.log(actions, "burnNFTHandler");

  try {
    const connection = getSolanaInstance.value;
    let mint = new PublicKey(NFTComputedData.value.mint);
    const fromWallet = getSolanaWalletInstance.value;
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromWallet,
      mint,
      fromWallet.publicKey
    );
    console.log(fromTokenAccount.address.toString(), "fromTokenAccount");

    store.dispatch("setStatus", StatusType.Approving);
    const signature = await actions.burnToken({
      connection: connection,
      wallet: fromWallet,
      token: fromTokenAccount.address,
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

const approveNFTHandler = () => {
  console.log("approveNFTHandler");
};

const unbundleNFT = () => {
  console.log("unbundleNFT");
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
}

.bundle-data__token {
  margin-right: 15px;
}
</style>