<template>
  <div class="app-page">
    <notifications group="foo" />

    <!-- Currently problem in that, Phantom wallet disconnecting by himself after 5-10 minutes of login-->
    <div v-if="connecting" class="loading-container loading-container--app">
      <spinner :size="82" color="#000" />
      <h1 v-if="connecting">Signing to wallet</h1>
    </div>

    <template v-else>
      <HeadBar v-if="connected"/>

      <div class="container">
        <router-view />
      </div>
    </template>

  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useWallet } from "solana-wallets-vue";
import HeadBar from "@/components/HeadBar/HeadBar.vue";
import Spinner from "@/components/Spinner";

const { connected, connecting, publicKey } = useWallet();
const store = useStore();
const router = useRouter();
const route = router.currentRoute;

const getAllNFTs = computed({
  get() {
    return store.getters["getAllNFTs"];
  },
});

onMounted(async () => {
  await store.dispatch("setIpfs");
  console.log(connecting.value, "connecting.value.value");
});

watch(() => connected.value, () => {
  console.log(connected.value, "CONNECTED! vue");
  console.log(connecting.value, "connecting vue!");
  console.log(route.value, "route vue!");
  if (connected.value === false) {
    store.dispatch("setWalletDisconnected");
    router.push({ name: "LoginView" });
  }

  // todo: add CHECKING with TOTAL NFT value

  // getting list of NFTs
  // cause connected unavailable in MOUNTED hook
  if (connected.value === true && getAllNFTs.value && getAllNFTs.value.length === 0) {
    store.dispatch("setAllSolanaNFts");
    console.log(getAllNFTs.value, "getAllNFTs vue!");
  }

  if (route.value.name === "LoginView" && (connecting.value || connected.value)) {
    store.dispatch("setConnected", publicKey.toString());
    router.push({ name: "ChooseNFT" });
  }
});
</script>

<style lang="scss">
@import "./styles/app.scss";
</style>
