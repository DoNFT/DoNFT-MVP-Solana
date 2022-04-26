<template>
  <div class="page">
    <nav-bar :navigation="getNav"/>
    <div
      v-if="getLoadingNFTsStatus" class="loading-container"
    >
      <spinner :size="92" color="#000" />
    </div>
    <main v-else>
      <h1>Choose NFT and apply effect</h1>
      <div
        class="nft-cards__contract-inner"
        v-if="getAllNFTs"
      >
        <div
          v-for="nft in getAllNFTs"
          :key="`key-${nft.mint}`"
          class="nft-cards__contract__item"
          :class="{ 'chosen-card': cardClass(nft.mint)}"
        >
          <token-card
            :metadata="nft"
            :edit-available="true"
            @click="chooseNFT(nft)"
          />
        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import NavBar from "@/components/NavBar/NavBar";
import TokenCard from "@/components/TokenCard/TokenCard";
import Spinner from "@/components/Spinner";

const store = useStore();
let token_id =  ref([]);

const getAllNFTs = computed({
  get() {
    return store.getters["getAllNFTs"];
  },
});

const getLoadingNFTsStatus = computed({
  get() {
    return store.getters["getLoadingNFTsStatus"];
  },
});


const cardClass = computed({
  get() {
    return(idx) => token_id.value.indexOf(idx) !== -1;
  },
});

console.log(token_id.value.length, "token_id.value.length");

const getNav = computed({
  get() {
    return [
      {
        text: "Create New",
        name: "CreateNFT",
        params: null,
      },
      {
        text: "Send",
        name: "SendNFT",
        params: {
          id: token_id.value && token_id.value.length === 1 ? token_id.value[0] : ""
        },
      },
      {
        text: "Bundle",
        name: "BundleNFT",
        params: {
          id: token_id.value && token_id.value.length > 1 ? token_id.value : null
        },
      },
    ];
  },
});

const chooseNFT = (item) => {
  const index = token_id.value.findIndex((_) => _ === item.mint);

  // Currently approving multiple NFTs is problem,
  // for this need smart contract, bundle approve + bundle sending
  if (index > -1) {
    token_id.value.splice(index, 1);
  } else {
    token_id.value.push(item.mint);
  }

  // this one for single actions, send or effects page
  token_id.value && token_id.value.length === 1 ? store.dispatch("setCurrentNFTdata", item) : store.dispatch("setCurrentNFTdata", {});

  // this one for bundle page
  store.commit("SET_BUNDLE_NFTS", token_id.value);
};
</script>

<style lang="scss">
.nft-cards {
  display: flex;
  flex-wrap: wrap;
}

.nft-cards__contract {
  width: 100%;

  h3 {
    margin-bottom: 10px;
  }
}

.nft-cards__contract-inner {
  display: flex;
  flex-wrap: wrap;
}

.nft-cards__contract__item {
  width: 19%;
  min-width: 200px;
  margin-bottom: 30px;
  margin-right: 5px;
  cursor: pointer;
  transition: transform .1s ease-in-out, box-shadow .1s ease;

  &:last-child {
    margin-right: 0;
  }
}

.nft-cards__contract__item--bundle-data {
  width: 24%;
  cursor: initial;

  img {
    border: 1px solid #2d094970;
    margin-top: 15px;
    border-radius: 4px;
  }
}

.nft-cards__contract__item.chosen-card {
  box-shadow: -2px -2px 12px 11px rgba(127, 251, 255, 0.7);
  transform: scale(0.9);
  .nft-cards__info {
    opacity: 1;
  }
}

.nft-cards__media {
  display: block;
  width: 100%;
  height: 200px;
  object-fit: cover;

  .form-nft__detail-page & {
    width: 300px;
    height: 300px;
  }
}

.nft-cards__title {
  margin-top: 20px;
}

h1 {
  margin-bottom: 30px;
}

</style>