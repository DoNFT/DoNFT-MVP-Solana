<template>
  <div class="page">
    <nav-bar :navigation="getNav"/>
    <main>
      <h1>Choose NFT and apply effect</h1>
      <div
        class="nft-cards__contract-inner"
        v-if="getAllNFTs"
      >
        <div
          v-for="nft in getAllNFTs"
          :key="`key-${nft.mint}`"
          class="nft-cards__contract__item"
        >
          <token-card
            :metadata="nft"
            :edit-available="true"
          />
        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
import { computed, onMounted } from "vue";
import { useStore } from "vuex";
// import { useWallet } from "solana-wallets-vue";
import NavBar from "@/components/NavBar/NavBar";
import TokenCard from "@/components/TokenCard/TokenCard";
// import { programs } from "@metaplex/js/";

// import { Connection } from "@solana/web3.js";

const store = useStore();
// const { publicKey } = useWallet();

const getAllNFTs = computed({
  get() {
    return store.getters["getAllNFTs"];
  },
});

const getNav = computed({
  get() {
    return [
      {
        text: "Create New",
        name: "CreateNFT",
        params: null,
      },
    ];
  },
});

// const getSolanaInstance = computed({
//   get() {
//     return store.getters["getSolanaInstance"];
//   },
// });

// const getSolanaWalletInstance = computed({
//   get() {
//     return store.getters["getSolanaWalletInstance"];
//   },
// });

onMounted(async () => {
  // const connection = new Connection("https://api.devnet.solana.com");
  // console.log(programs, "programs");
  // console.log(getSolanaWalletInstance.value.publicKey.toString(), "getSolanaWalletInstance.value.publicKey.toString()");
  // // const tokenPublicKey = "Gz3vYbpsB2agTsAwedtvtTkQ1CG9vsioqLW3r9ecNpvZ";
  // // const connection = new Connection("devnet");
  // console.log(getAllNFTs.value, "getAllNFTs");
  // console.log(publicKey, "getSolanaWalletInstance.value.publicKey");
  // // const data = await Metadata.findByOwnerV3(connection, tokenPublicKey);
  // // console.log(data, "data");
  // const accounts = await connection.getAccountInfo(
  //   publicKey.value,
  //   connection,
  // );
  // console.log(accounts, "accounts");
});
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

h1 {
  margin-bottom: 30px;
}

</style>