<template>
  <div class="page">
    <nav-bar :navigation="getNav"/>
    <div v-if="!getNFTsLoadStatus" class="loading-container">
      <spinner :size="92" color="#000" />
      <h1>{{ statusText }}</h1>
    </div>
    <main v-else>
      <div>
        <h1>Selected NFT</h1>
        <div
          class="nft-cards-box"
        >
          <div
            class="nft-cards"
            v-if="NFTComputedData"
          >
            <token-card
              :get-info="true"
              :metadata="NFTComputedData"
              :edit-available="false"
            />
          </div>
        </div>
      </div>

      <div
        class="effect-cards-box"
        v-if="filterEffectsContractCards && filterEffectsContractCards.length && NFTComputedData"
      >
        <h1 class="h1--effects">NFT effects</h1>
        <effect-cards
          @card-clicked="chooseEffect"
          :show-id="false"
          :cards="filterEffectsContractCards"
          :choice="[getEffectChoice]"
          content-type="video"
        ></effect-cards>
        <button
          class="main-btn"
          @click="handleRedirect(item)"
        >Submit</button>
      </div>
      <!-- <div v-else>
        <h1 class="effect-cards-box__no-effect">You have no effects</h1>
        <h2>Add some effects here</h2>
        <router-link
          class="main-btn main-btn--no-effect"
          :to="{ name: 'CreateNFT'}"
        >Create Effect</router-link>
      </div> -->
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import Spinner from "@/components/Spinner";
import TokenCard from "@/components/TokenCard/TokenCard";
import NavBar from "@/components/NavBar/NavBar";
import EffectCards from "@/components/EffectCards/EffectCards";

const store = useStore();
const router = useRouter();

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

const getEffectChoice = computed({
  get() {
    return store.getters["getEffectChoice"];
  },
});

const getAllNFTs = computed({
  get() {
    return store.getters["getAllNFTs"];
  },
});

const getNFTsLoadStatus = computed({
  get() {
    return store.getters["getNFTsLoadStatus"];
  },
});

const filterEffectsContractCards = computed({
  get() {
    return getAllNFTs.value.filter((item) => {
      if (item.mint !== NFTComputedData.value.mint) {
        return item;
      }
    });
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

const handleRedirect = async () => {
  router.push({
    name: "AddEffectConfirm",
    params: {
      id: NFTComputedData.value.mint,
      effectId: getEffectChoice.value,
    }
  });
};
const chooseEffect = async (card) => {
  if (getEffectChoice.value && card.mint === getEffectChoice.value) {
    store.commit("SET_EFFECT_CHOICE", null);
  } else {
    store.commit("SET_EFFECT_CHOICE", card.mint);
  }
};
</script>
