<template>
  <div class="page">
    <nav-bar
      :navigation="getNav"
      :show-generate-nft="true"
      @generate-random-nft="generateRandomNFT"
    />
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
          v-for="contractData in filteredNFTbyContract"
          :key="contractData.name"
          class="nft-cards__contract"
        >
          <template v-if="contractData.items && contractData.items.length">
            <h3>Contract: {{contractData.name}}</h3>
            <div class="nft-cards__contract-inner">
              <div
                v-for="nft in contractData.items"
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
          </template>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
import { actions } from "@metaplex/js";
import { computed, ref, reactive } from "vue";
import { useStore } from "vuex";
import NavBar from "@/components/NavBar/NavBar";
import TokenCard from "@/components/TokenCard/TokenCard";
import Spinner from "@/components/Spinner";
import { AppError, SystemErrors } from "@/utilities";
import { notify } from "@kyvg/vue3-notification";

const store = useStore();
let token_id =  ref([]);

// todo: change creator to wallet id
let nftObj = reactive({
  name: "",
  symbol: "test",
  seller_fee_basis_points: 0,
  description: "",
  image: "",
  isMutable: 0,
  properties: {
    files: [
      {
        uri: "",
        type: "image/*"
      }
    ],
    category: "image",
    creators: [
      {
        "address": "3psnJUFeJ4QyHwKjbfycFKrFap9FxHJehAYmMc3ZRBWV",
        "share": 100
      }
    ]
  },
  collection: null,
  use: null
});

const randomEffectsArr = [
  "https://bafkreif42p2e7ep5q3kpuoz2dlpxmctwr7unajswe3ibq6fm6rcinvjwk4.ipfs.nftstorage.link/",
  "https://bafkreieqmictg2ujcnsrudnq72mmijb3nelwlpzb7gr7xhn77j2aihzlcu.ipfs.nftstorage.link/",
  "https://bafybeifdsj6pzie4vos42oyiou3lyesyefs5uj7uyxlgjqbdmg7msdvvpi.ipfs.nftstorage.link/",
  "https://bafybeigfhupxt6zjfqykf54whf7pabtugo5l57n6t5k5or66e4sovsdaiu.ipfs.nftstorage.link/",
  "https://bafybeibe2px7qbklyk4r7d4mxttb3cqwjx46cdjteg6pd55oajbmxxcvfm.ipfs.nftstorage.link/",
  "https://bafybeidctmnh3y4g4i57b5pltsvslkjjooa64avfyyoj5de25mouf3ct5e.ipfs.nftstorage.link/",
  "https://bafybeidctmnh3y4g4i57b5pltsvslkjjooa64avfyyoj5de25mouf3ct5e.ipfs.nftstorage.link/",
];

const randomNFTArr = [
  "https://bafkreibsgijmp53nwssszihmmq25q4ippdfqm67hplgvnjajyymsngksey.ipfs.nftstorage.link/",
  "https://bafkreieflpqauetjd52ywpcyqggp66vtnfqhkmthr6ng3yqagk45yltp6q.ipfs.nftstorage.link/",
  "https://bafkreig3suewzhzunlimmtfhycefv3szqux5qbsrllvovrk7ftv5aifmhu.ipfs.nftstorage.link/",
  "https://bafkreih6hd4ysjce443cmiuagli5bnog4g6uz2r66xqmyg4d6ufdh3ttmm.ipfs.nftstorage.link/",
  "https://bafkreibb4ukdluctf3d377i4r627xcn2ydqtl35yulawwa2ty65cysv6vq.ipfs.nftstorage.link/",
];


const getAllNFTs = computed({
  get() {
    return store.getters["getAllNFTs"];
  },
});

const filteredNFTbyContract = computed({
  get() {
    if (getAllNFTs.value && getAllNFTs.value.length) {
      const nftContract = [];
      const effectContract = [];
      const bundleContract = [];

      getAllNFTs.value.forEach((item) => {
        if (item.data.symbol === "nft") nftContract.push(item);
        if (item.data.symbol === "effect") effectContract.push(item);
        if (item.data.symbol === "bundle") bundleContract.push(item);
      });

      return [{ name: "nft",  items: nftContract }, { name: "effect", items: effectContract }, { name: "bundle", items: bundleContract }];
    }

    return [];
  }
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
      {
        text: "Effect",
        name: "AddEffect",
        params: {
          id: token_id.value && token_id.value.length === 1 ? token_id.value[0] : ""
        },
      },
    ];
  },
});

const getSolanaWalletInstance = computed({
  get() {
    return store.getters["getSolanaWalletInstance"];
  },
});

// const getStatus = computed({
//   get() {
//     return store.getters["getStatus"];
//   },
// });

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

// Creating Random NFT, depend on Math random
// currently only for VUE_APP_NFTS_CONTRACT and VUE_APP_NFTS_EFFECTS_CONTRACT
const generateRandomNFT = async (nftType) => {
  try {
    const connection = getSolanaInstance.value;
    let randomNumber = Math.floor(Math.random() * 5);
    let randomImage =  randomNFTArr[randomNumber];

    if (nftType === "effectNFT") {
      randomNumber = Math.floor(Math.random() * 6);
      randomImage =  randomEffectsArr[randomNumber];
    }

    console.log(randomNumber, "randomNumber");

    nftObj = {
      ...nftObj,
      name: `Test NFT ${randomNumber}`,
      symbol: "nft",
      image: randomImage,
    };

    if (nftType === "effectNFT") {
      nftObj = {
        ...nftObj,
        name: `Test Effect NFT ${randomNumber}`,
        symbol: "effect",
        image: randomImage,
      };
    }

    try {
      // is Random, for skipping image ipfs deploy
      await store.dispatch("setDeployToIPFS", { isImageDeployed: true, meta: nftObj });
    } catch(err) {
      if (err instanceof AppError) {
        throw err; 
      } else {
        throw SystemErrors.IPFS_SAVE;
      }
    }

    try {
      console.log("CREATING");
      const signature = await actions.mintNFT({
        connection,
        wallet: getSolanaWalletInstance.value,
        uri: getNFTdeployResult.value,
        maxSupply: 1
      });
      const response = await connection.confirmTransaction(signature.txId, "finalized");
      console.log(signature, "CREATING");
      if (response.value && response.value.err === null) {
        // store.dispatch("setStatus", StatusType.ChoosingParameters);
        store.dispatch("setAllSolanaNFts");
        // router.push({ name: "ChooseNFT"});
        notify({
          title: "Transaction status",
          type: "success",
          text: "NFT successfully Minted!",
          duration: 6000,
        });
      }

    } catch(err) {
      console.log(err, "error");
      if (err instanceof AppError) {
        throw err; 
      } else {
        throw SystemErrors.MINT_NFT;
      }
    }
  } catch(err) {
    console.log(err, "MAIN ERROR");
    // if(err instanceof AppError) {
    //   alert(err.message)
    // } else {
    //   console.log(err)
    //   alert("Undefined error")
    // }
  }
};

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