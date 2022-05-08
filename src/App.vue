<template>
  <div class="app-page">
    <notifications />

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
import connection from "@/solanaInit";
import { getEffects } from "@/api";

import HeadBar from "@/components/HeadBar/HeadBar.vue";
import Spinner from "@/components/Spinner";

const { connected, connecting, publicKey, wallet } = useWallet();
const store = useStore();
const router = useRouter();
const route = router.currentRoute;

const getWalletError = computed({
  get() {
    return store.getters["getWalletError"];
  },
});

const getAllNFTs = computed({
  get() {
    return store.getters["getAllNFTs"];
  },
});

onMounted(async () => {
  await store.dispatch("setIpfs");
  console.log(getEffects, "getEffects");
  const effects = await getEffects();
  console.log(effects, "effects");
});

// there are 2 cases of errors in Solana,
// 1 - user reject wallet popup on Approve, Send, Burn... no need to redirect
// 2 - user wallet auto disconnected and phantom ask to login, and if user reject, we need to redirect to loginview
watch(() => getWalletError.value, () => {
  console.log(getWalletError.value, connected.value, "watch getWalletError");
  if (getWalletError.value === true && connected.value === false) {
    router.push({ name: "LoginView" });
    store.dispatch("setWalletError", false);
  }
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
    store.dispatch("setSolanaInstance", connection);
    store.dispatch("setSolanaWalletInstance", wallet.value);
    store.dispatch("setAllSolanaNFts");
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
