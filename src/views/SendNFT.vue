<template>
  <div class="page">
    <nav-bar :navigation="getNav"/>
    <main>
      <div>
        <h1 >Send NFTs</h1>
        <div
          class="form-nft-send form-nft__detail-page"
        >
          <div
            class="nft-cards"
            v-if="NFTComputedData"
          >
            <token-card
              :metadata="NFTComputedData"
              :edit-available="false"
            />
          </div>
          <div class="form-nft-send__inputs">
            <div>
              <span class="form-nft-send__inputs-title">Receipt ID</span>
              <input
                type="text"
                placeholder="Receipt ID"
                class="input form-nft__input"
                v-model="receiver_id"
              >
            </div>
            <div class="form-nft__bottom">
              <button
                class="main-btn"
                @click="sendNFTHandler"
              >Send</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import NavBar from "@/components/NavBar/NavBar";
import TokenCard from "@/components/TokenCard/TokenCard";

const router = useRouter();
const store = useStore();

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

const getAllNFTs = computed({
  get() {
    return store.getters["getAllNFTs"];
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

let receiver_id = ref(null);


const sendNFTHandler = () => {
  console.log("sendNFTHandler");
};
</script>