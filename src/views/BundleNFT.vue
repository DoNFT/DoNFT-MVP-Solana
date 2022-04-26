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
            v-model="nftObj.metadata.title"
          >
          <textarea
            type="text"
            placeholder="NFT description"
            class="input form-nft__input form-nft__textarea"
            v-model="nftObj.metadata.description"
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
import { reactive, onBeforeMount, ref, computed } from "vue";
import { useStore } from "vuex";

import NavBar from "@/components/NavBar/NavBar";
import TokenCard from "@/components/TokenCard/TokenCard";
import Uploader from "@/components/Uploader/Uploader";

const store = useStore();

let nftArray = ref([]);

const nftObj = reactive({
  metadata: {
    title: "NFT token 2 title",
    description: "NFT token 2 description",
    media: null,
  }
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

onBeforeMount(() => {
  console.log(sessionStorage, "sessionStorage");
  nftArray.value = sessionStorage.getItem("tokens_id").split(",");

  console.log(nftArray, "store.nftArray");
});

const bundleNFTs = () => {
  console.log("BUNDLE");
};

const setUploadedImg = (src) => {
  nftObj.metadata.media = src; 
  store.dispatch("passNFT", nftObj.metadata);
};
</script>