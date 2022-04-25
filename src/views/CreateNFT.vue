<template>
  <div class="page">
    <nav-bar :navigation="getNavigation"/>
    <main>
      <h1>Create new NFT</h1>
      <div class="form-nft">
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
      </div>
      <div
        v-if="[
          StatusType.Approving,
          StatusType.Sending,
          StatusType.Minting,
        ].includes(getStatus)" class="loading-container"
      >
        <spinner :size="92" color="#000" />
        <h2>{{ getStatusText(getStatus) }}</h2>
      </div>

    </main>
  </div>
</template>

<script setup>
import { Metaplex } from "@metaplex-foundation/js-next";
import { reactive, computed } from "vue";
import { useStore } from "vuex";
import statusMixin from "@/mixins/StatusMixin";
import { notify } from "@kyvg/vue3-notification";

import NavBar from "@/components/NavBar/NavBar";
import Uploader from "@/components/Uploader/Uploader";
import Spinner from "@/components/Spinner";

const store = useStore();
const { StatusType } = statusMixin();

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

// const getSolanaWalletInstance = computed({
//   get() {
//     return store.getters["getSolanaWalletInstance"];
//   },
// });

const getStatus = computed({
  get() {
    return store.getters["getStatus"];
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

// onMounted(() => {
//   console.log(actions, "actions");
// });

const setUploadedImg = (img) => {
  nftObj.image = img; 
};

const createNewNFT = async () => {
  console.log(nftObj, "NFT OBJ");
  try {
    const connection = getSolanaInstance.value;

    const mx = Metaplex.make(connection);

    store.dispatch("setStatus", StatusType.DeployingToIPFS);
    // mx.use(walletOrGuestIdentity(getSolanaWalletInstance.value));
    const { nft } = await mx.nfts().createNft({
      uri: getNFTdeployResult.value,
    });
    console.log("Metaplex 1", Metaplex);
    console.log("mx", mx.nfts());
    console.log("nft", nft);
    // store.dispatch("setStatus", StatusType.Minting);
    // const response = await connection.confirmTransaction(signature.txId, "processed");
    // console.log("response signature 2", response);

    // if (response.value && response.value.err === null) {
    //   store.dispatch("setStatus", StatusType.ChoosingParameters);
    //   store.dispatch("setAllSolanaNFts");
    //   router.push({ name: "ChooseNFT"});
    //   notify({
    //     title: "Transaction status",
    //     type: "success",
    //     text: "NFT successfully Minted!",
    //     duration: 6000,
    //   });
    // }

  } catch(err) {
    console.log(err, "ERRROR createNewNFT");
    store.dispatch("setStatus", StatusType.ChoosingParameters);
    notify({
      title: "Transaction status",
      type: "error",
      text: `Something wrong, Error: ${err}`,
      duration: 6000,
    });
  }
};

const getStatusText = (status) => {
  const statusData = statusMixin(status);
  console.log(statusData, "statusData");

  return statusData.statusText;
};
</script>
