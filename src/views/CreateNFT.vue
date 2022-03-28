<template>
  <div class="page">
    <nav-bar :navigation="getNavigation"/>
    <main>
      <h1>Create new NFT</h1>
      <form class="form-nft">
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
      </form>
    </main>
  </div>
</template>

<script setup>
import NavBar from "@/components/NavBar/NavBar";
import Uploader from "@/components/Uploader/Uploader";
import {
  actions,
} from "@metaplex/js";
import { reactive, computed, onMounted } from "vue";
import { useStore } from "vuex";
// import StatusType from "@/mixins/StatusMixin";

const store = useStore();

const nftObj = reactive({
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
        type: "image/jpeg"
      }
    ],
    category: "image",
    creators: [
      {
        "address": "8BZZo3mv9xjdrhpJgBAYQDYmsAkgJdW3riaJPJTL4gYz",
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

onMounted(() => {
  console.log(actions, "actions");
});

const setUploadedImg = (img) => {
  nftObj.image = img; 
};

const createNewNFT = async () => {
  console.log(nftObj, "NFT OBJ");

  await store.dispatch("setDeployToIPFS", nftObj);

  console.log(getNFTdeployResult, "CREATING");
  actions.mintNFT({
    connection: getSolanaInstance.value,
    wallet: getSolanaWalletInstance.value,
    uri: getNFTdeployResult.value,
    maxSupply: 1
  });
};

</script>
