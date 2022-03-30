<template>
  <div class="page">
    <nav-bar :navigation="getNav"/>
    <div
      v-if="!NFTComputedData" class="loading-container"
    >
      <spinner :size="92" color="#000" />
    </div>
    <main v-else>
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
              :get-info="true"
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
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { actions, programs } from "@metaplex/js/";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

import NavBar from "@/components/NavBar/NavBar";
import TokenCard from "@/components/TokenCard/TokenCard";
import Spinner from "@/components/Spinner";

const router = useRouter();
const store = useStore();
let receiver_id = ref("8T8zhN7AAR3UBfYhiBvKkzS39ii3AZMARZZz2KjA5UnV");

const getSolanaInstance = computed({
  get() {
    return store.getters["getSolanaInstance"];
  },
});

const getSolanaWalletInstance = computed({
  get() {
    return store.getters["getSolanaWalletInstance"];
  },
});

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

onMounted(async () => {
  const tx = "4SZUr1dQYRL4PoNAx81AJ5LfJRiDJQ6sZTYiuijYwe983d4ombuodeqSdxBNTPN8TJaVqSMRZwtEHACU1aPDNe4Y";
  const response = await getSolanaInstance.value.getTransaction(tx);
  console.log(getSolanaInstance.value, "resgetSolanaInstance.valueponse");
  console.log(response, "response");
});
const sendNFTHandler = async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  console.log(programs, "programs");
  console.log(actions, "actions");

  let response = await getSolanaInstance.value.getParsedTokenAccountsByOwner(getSolanaWalletInstance.value.publicKey, { programId: TOKEN_PROGRAM_ID });
  let mintAccount = await getMint(getSolanaInstance.value, new PublicKey(NFTComputedData.value.mint));
  console.log(response, "response.value.getParsedTokenAccountsByOwner");
  console.log(mintAccount, "response.mintAccount");
  let token = getSolanaWalletInstance.value.publicKey;
  let mint = new PublicKey(NFTComputedData.value.mint);
  console.log(token, "Buffer.from(token)");
  console.log(mint.toString(), "mint");

  const fromWallet = getSolanaWalletInstance.value;
  console.log(receiver_id, "receiver_id");
  const toWallet = new PublicKey(receiver_id.value);
  console.log(toWallet.toString(), "TtoWallet");
  // const tokenAccountYPubkey = new PublicKey("GMxZfDmpR1b3vdJYXHzdF5noVLQogZuUAsDHHQ3ytPfV");
  console.log(getSolanaWalletInstance.value.publicKey.toString(), "getSolanaWalletInstance.value.publicKey");
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    fromWallet.publicKey
  );

  console.log(fromTokenAccount.address.toString(), "TOKEN fromTokenAccount");

  try {
    const signature = await actions.sendToken({
      connection: getSolanaInstance.value,
      wallet: fromWallet,
      source: fromTokenAccount.address,
      destination: toWallet,
      mint: mint,
      amount: 1,
    });
    console.log(signature, "dest ATA");
    const response = await getSolanaInstance.value.confirmTransaction(signature.txId, "processed");
    console.log("response signature", response);

    if (response.value && response.value.err === null) {
      store.dispatch("setAllSolanaNFts");
      router.push({ name: "ChooseNFT"});
    }
    console.log(actions, "actions ATA");
  } catch (err) {
    console.log(err, "ERRROR");
  }
};
</script>