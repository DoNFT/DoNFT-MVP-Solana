<template>
  <div class="page">
    <nav-bar :navigation="getNav"/>
    <main>
      <h1>This is an ChooseNFTChooseNFTChooseNFT page</h1>
    </main>
  </div>
</template>
<script setup>
import { computed } from "vue";
import NavBar from "@/components/NavBar/NavBar";

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
// export default {
//   name: "ChooseNFT",

//   components: {
//     NavBar,
//     IconComponent,
//   },
  
//   computed: {
//     getNav() {
//       return [
//         {
//           text: "Create New",
//           name: "CreateNFT",
//           params: null,
//         },
//         // {
//         //   text: 'Send',
//         //   name: 'SendNFT',
//         //   params: {
//         //     id: this.nftObj && this.nftObj.token_id.length === 1 ? this.nftObj.token_id[0] : null
//         //   },
//         // },
//         // {
//         //   text: 'Bundle',
//         //   name: 'BundleNFT',
//         //   params: {
//         //     id: this.nftObj && this.nftObj.token_id.length > 1 ? this.nftObj.token_id : null
//         //   },
//         // },
//         // {
//         //   text: 'Add Effect',
//         //   name: 'AddEffect',
//         //   params: {
//         //     id: this.nftObj && this.nftObj.token_id.length === 1 ? this.nftObj.token_id[0] : null
//         //   },
//         // },
//       ];
//     }
//   }
// };
</script>