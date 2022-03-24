<template>
  <div class="home-text">
    <div class="home-text__inner">
      <h1>Welcome to DoNFT demo on Near</h1>
      <p class="home-text__inner__subtext">
        Use power of neural network algorithms to create new unique combinations
        of digital art
      </p>
      <p v-if="connected" class="home-text__inner__subtext">
        Go ahead and click the button below to try it out:
      </p>
      <p
        style="text-align: center; margin-top: 2.5em"
      >
        <wallet-multi-button dark></wallet-multi-button>
      </p>
    </div>
    <img src="@/assets/home_img.jpg" style="height: 30%; border-radius: 20%" />
  </div>
</template>

<script setup>
import { watch } from "vue";
import { WalletMultiButton, useWallet } from "solana-wallets-vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const { connected, publicKey } = useWallet();
const store = useStore();
const router = useRouter();

watch(() => connected.value, () => {
  console.log(connected.value, "CONNECTED!");
  if (connected.value) {
    store.dispatch("setConnected", publicKey.toString());
    router.push({ name: "ChooseNFT" });
  }
});

// export default {
//   name: "LoginView",
//   data() {
//     return {
//       phantomWallet: null,
//       publicWalletAddress: "",
//       phantom: null,
//     };
//   },

//   components: {
//     modalDialog,
//   },

//   computed: {
//     ...mapGetters(["getDialogWalletStatus"]),
//   },

//   mounted() {
//     if (this.getCurrentWallet || sessionStorage.getItem("solana_wallet_address")) {
//       this.$router.push({ name: "ChooseNFT" });
//     }
//   },

//   methods: {
//     ...mapActions(["setWalletDialog"]),
//     toggleWalletDialog() {
//       this.setWalletDialog(!this.getDialogWalletStatus);
//     },
//   },
// };
</script>

<style scoped>
.home-text {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  min-height: 60vh;
}

.home-text__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 50%;
}

.home-text img {
  width: 30%;
  margin-left: 20px;
}
</style>
