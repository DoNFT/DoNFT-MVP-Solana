<template>
  <div class="page">
    <nav-bar :navigation="getNavigation"/>
    <main>
      <h1>Create new NFT</h1>
      <form class="form-nft">
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
      </form>
    </main>
  </div>
</template>

<script>
import NavBar from "@/components/NavBar/NavBar";
import Uploader from "@/components/Uploader/Uploader";
import StatusType from "@/mixins/StatusMixin";
import {
  actions,
} from "@metaplex/js";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "CreateNFT",

  components: {
    NavBar,
    Uploader,
  },

  mixins: [StatusType],

  data() {
    return {
      nftObj: {
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
      },
      getNavigation: [
        {
          text: "Back to Gallery",
          name: "ChooseNFT",
        },
      ],
      notificationVisible: false,
    };
  },

  computed: {
    ...mapGetters([
      "getSolanaWalletInstance",
      "getSolanaInstance",
      "getNFTdeployResult",
    ]),
  },

  mounted() {
    console.log(actions, "actions");
  },
  methods: {
    ...mapActions(["setDeployToIPFS"]),

    setUploadedImg(src) {
      this.nftObj.image = src; 
    },
    async createNewNFT() {

      await this.setDeployToIPFS(this.nftObj);

      console.log(this.getNFTdeployResult, "CREATING");
      actions.mintNFT({
        connection: this.getSolanaInstance,
        wallet: this.getSolanaWalletInstance,
        uri: this.getNFTdeployResult,
        maxSupply: 1
      });
    }
  }
};
</script>
