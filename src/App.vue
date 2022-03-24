<template>
  <div class="app">
    <notifications group="foo" />

    <!-- <div v-if="getContractLoading" class="loading-container loading-container--app">
      <spinner :size="92" color="#000" />
    </div> -->


    <HeadBar v-if="connected"/>

    <div class="container">
      <router-view />
    </div>

  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useWallet } from "solana-wallets-vue";
import HeadBar from "@/components/HeadBar/HeadBar.vue";

const { connected, wallet } = useWallet();
const store = useStore();
const router = useRouter();

onMounted(() => {
  store.dispatch("setIpfs");

  // todo: move to more proper place
  if (wallet.value) {
    store.dispatch("setSolanaWalletInstance", wallet.value);
  }
});

watch(() => connected.value, () => {
  if (connected.value === false) {
    store.dispatch("setWalletDisconnected");
    router.push({ name: "LoginView" });
  }
});

// export default {
//   mounted() {
//     let sessionAddress = sessionStorage.getItem('solana_wallet_address');

//     console.log(this.$route, 'this.$route adress');
//     if (this.$router.name === 'Login' && sessionAddress) {
//       this.$router.replace({ name: 'ChooseNFT' });
//     }
//   },
//   methods: {
//     ...mapActions([
//       'setIpfs',
//     ]),
//     ...mapMutations(['setConnected']),
//   },
// };
</script>

<style lang="scss">
@import "./styles/app.scss";
</style>
