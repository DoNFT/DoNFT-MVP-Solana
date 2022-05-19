<template>
  <div class="page">
    <nav-bar :navigation="getNavigation"/>
    <main>
      <h1>Create new NFT</h1>
      <div class="form-nft">
        <uploader-comp @selected="setUploadedImg"/>
        <div class="form-ntf__inputs">
          <!-- <span class="form-nft-send__inputs-title">Contract</span> -->
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
          <span class="form-nft-send__inputs-title">NFT symbol</span>
          <textarea
            type="text"
            placeholder="NFT symbol"
            class="input form-nft__input form-nft__textarea"
            v-model="nftObj.symbol"
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
import { actions } from "@metaplex/js";
import { reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import statusMixin from "@/mixins/StatusMixin";
import { notify } from "@kyvg/vue3-notification";

import NavBar from "@/components/NavBar/NavBar";
import UploaderComp from "@/components/Uploader/UploaderComp";
import Spinner from "@/components/Spinner";

const store = useStore();
const router = useRouter();
const { StatusType } = statusMixin();

const nftObj = reactive({
  name: "NFT token 2 title",
  symbol: "nft",
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
        "address": "3psnJUFeJ4QyHwKjbfycFKrFap9FxHJehAYmMc3ZRBWV",
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

//"https://ipfs.io/ipfs/QmX4rTazAq9gmJJJBP3a9FFyQZnoYQfqUUCCizRyhopcAt"

const createNewNFT = async () => {
  console.log(nftObj, "NFT OBJ");
  try {
    const connection = getSolanaInstance.value;

    store.dispatch("setStatus", StatusType.DeployingToIPFS);
    await store.dispatch("setDeployToIPFS", { isImageDeployed: false, meta: nftObj });

    store.dispatch("setStatus", StatusType.Approving);
    console.log(getNFTdeployResult, "CREATING");
    const signature = await actions.mintNFT({
      connection,
      wallet: getSolanaWalletInstance.value,
      uri: getNFTdeployResult.value,
      maxSupply: 1
    });
    const response = await connection.confirmTransaction(signature.txId, "finalized");
    console.log(signature.mint.toString(), "signature mint");

    // console.log(setBundleAuthority, "FINAL RESPONSE");
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