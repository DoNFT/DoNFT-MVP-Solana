<template>
  <div class="page">
    <nav-bar :navigation="getNav"/>
    <div v-if="!getNFTsLoadStatus" class="loading-container">
      <spinner :size="92" color="#000" />
      <h2>{{ statusText }}</h2>
    </div>
    <main v-else>
      <div class="effect-confirm">
        <div class="effect-confirm__selected">
          <h2>Selected NFT</h2>
          <div
            class="nft-cards-box"
            v-if="NFTComputedData"
          >
            <token-card
              :get-info="true"
              :metadata="NFTComputedData"
              :edit-available="false"
            />
          </div>
        </div>
        <div class="effect-confirm__selected">
          <h2>NFT effects</h2>

          <token-card
            v-if="getEffect"
            :metadata="getEffect"
            :edit-available="false"
          />
        </div>
        <div class="form-nft-send__inputs form-nft-send__inputs--effects">
          <h2>Bundle metadata</h2>
          <div class="effect-form-wrap">
            <span class="form-nft-send__inputs-title">Title</span>
            <input
              type="text"
              placeholder="NFT title"
              class="input form-nft__input"
              v-model="nftObj.name"
            >
            <div class="form-nft__bottom">
              <button
                class="main-btn"
                @click="handleMint"
              >Confirm</button>
            </div>
          </div>
        </div>
      </div>
      <!-- <div
        v-if="[
          StatusType.Applying,
          StatusType.DeployingToIPFS,
          StatusType.DeployedToIPFS,
          StatusType.Minting
        ].includes(getStatus)" class="loading-container"
      >
        <spinner :size="92" color="#000" />
        <h2>{{ statusText }}</h2>
      </div> -->
    </main>
  </div>
</template>

<script setup>
import { actions } from "@metaplex/js";
import { computed, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import Spinner from "@/components/Spinner";
import TokenCard from "@/components/TokenCard/TokenCard";
import NavBar from "@/components/NavBar/NavBar";
import { notify } from "@kyvg/vue3-notification";
// import StatusType from "@/mixins/StatusMixin";
import { AppError, SystemErrors, CID_RE } from "@/utilities";
import { applyNFTsEffect } from "@/api";
import { Account, PublicKey, SystemProgram, Keypair, TransactionInstruction, Transaction } from "@solana/web3.js";
import { AccountLayout, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

const store = useStore();
const router = useRouter();

const CONTRACT_PROGRAM_ID = new PublicKey(
  "DyPhsdovhyrTktsJS6nrghGvkRoo2FK3ztH1sKKPBDU4",
);

const fullAccount = Keypair.fromSecretKey(Uint8Array.from([168,137,178,118,85,0,219,78,149,104,214,158,185,33,196,108,238,183,141,26,35,60,189,245,167,33,237,202,49,205,192,220,41,251,23,23,113,90,97,50,214,88,148,121,99,2,223,81,55,89,151,23,238,43,56,91,242,238,27,97,242,110,125,214]));
const uintSeed = Uint8Array.from([138,133,11,131,247,141,131,185,159,96,109,107,180,236,20,176,63,41,69,76,179,63,201,132,193,76,220,28,143,52,254,215,31,128,60,52,52,212,51,196,74,36,28,61,13,2,210,174,164,102,234,182,74,120,227,153,67,193,173,126,14,38,102,210]);

let nftObj = reactive({
  name: "",
  symbol: "test",
  seller_fee_basis_points: 0,
  description: "NFT token 2 description",
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

const getAllNFTs = computed({
  get() {
    return store.getters["getAllNFTs"];
  },
});

const getNFTsLoadStatus = computed({
  get() {
    return store.getters["getNFTsLoadStatus"];
  },
});

const getEffect = computed({
  get() {
    return store.getters["getEffect"];
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

const getSolanaWalletInstance = computed({
  get() {
    return store.getters["getSolanaWalletInstance"];
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

onMounted(() => {
  store.commit("SET_EFFECT_CHOICE", router.currentRoute.value.params.effectId);
});

const handleMint = async () => {
  console.log(getSolanaWalletInstance.value.publicKey, "handleMint");
  if (!nftObj.name) {
    alert("Title field is empty");
  } else {
    const connection = getSolanaInstance.value;
    const fromWallet = getSolanaWalletInstance.value;
    const tokenData1 = await store.dispatch("setTokenImage", NFTComputedData.value.data);
    const tokenData2 = await store.dispatch("setTokenImage", NFTComputedData.value.data);

    const effectObj = {
      original: {
        contract: fromWallet.publicKey,
        tokenId: NFTComputedData.value.mint,
        contentUrl: tokenData1.image,
      },
      modificator: {
        contract: fromWallet.publicKey,
        tokenId: getEffect.value.mint,
        contentUrl: tokenData2.image,
      },
      sender: fromWallet.publicKey,
    };

    try {
      const imageCID = await applyNFTsEffect(effectObj);
      console.log(imageCID, "IAMGE CID");
      const cid = CID_RE.exec(imageCID)?.[0];
      console.log(cid, "CID");
      nftObj.image = `https://ipfs.io/ipfs/${cid}`;
    } catch(err) {
      console.log(err);
      if (err instanceof AppError) {
        throw err; 
      } else {
        throw SystemErrors.NFT_EFFECT_CONFIRM;
      }
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

      const keyWallet = new PublicKey(getSolanaWalletInstance.value.publicKey.toString());

      const token1 = new PublicKey(NFTComputedData.value.mint);
      const token2 = new PublicKey(getEffect.value.mint);
      console.log(keyWallet, "keyWallet");

      const BundleTokenAccount1 = await PublicKey.findProgramAddress(
        [
          fromWallet.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          token1.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      console.log(BundleTokenAccount1[0].toString(), "BundleTokenAccount1");

      const BundleTokenAccount2 = await PublicKey.findProgramAddress(
        [
          fromWallet.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          token2.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      console.log(BundleTokenAccount2[0].toString(), "BundleTokenAccount1");

      const TokenMintAccountPubkey1 = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(BundleTokenAccount1[0], "devnet")).value.data.parsed.info.mint);
      const TokenMintAccountPubkey2 = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(BundleTokenAccount2[0], "devnet")).value.data.parsed.info.mint);
      console.log(TokenMintAccountPubkey1, "TokenMintAccountPubkey1");
      console.log(TokenMintAccountPubkey2, "TokenMintAccountPubkey2");

      const tempTokenAccount1 = new Account();
      const tempTokenAccount2 = new Account();

      // TOKENS STORAGE
      const createTempTokenAccount1 = SystemProgram.createAccount({
        programId: TOKEN_PROGRAM_ID,
        space: AccountLayout.span,
        lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
        fromPubkey: keyWallet,
        newAccountPubkey: tempTokenAccount1.publicKey
      });

      const createTempTokenAccount2 = SystemProgram.createAccount({
        programId: TOKEN_PROGRAM_ID,
        space: AccountLayout.span,
        lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
        fromPubkey: keyWallet,
        newAccountPubkey: tempTokenAccount2.publicKey
      });


      // store.dispatch("setStatus", StatusType.DeployingToIPFS);
      await store.dispatch("setDeployToIPFS", { isImageDeployed: true, meta: nftObj });
      // store.dispatch("setStatus", StatusType.Approving);
      //"https://ipfs.io/ipfs/Qmb8yTr9CRhFzTwasPCgXAtLHrfhmNw6i4raJZHr82hzUs"

      console.log(getNFTdeployResult, "CREATING");
      const signature = await actions.mintNFT({
        connection,
        wallet: getSolanaWalletInstance.value,
        uri: getNFTdeployResult.value,
        maxSupply: 1,
      });

      const response = await connection.confirmTransaction(signature.txId, "finalized");

      const bundleMintAuthority = new PublicKey((await getSolanaInstance.value.getParsedAccountInfo(signature.mint, "devnet")).value.data.parsed.info.mintAuthority);
      console.log(bundleMintAuthority.toString(), "bundleMintAuthority");

      const bundleStorageTokenAccountProgram = await PublicKey.findProgramAddress(
        [
          signature.mint.toBuffer(),
        ],
        CONTRACT_PROGRAM_ID
      );

      console.log(uintSeed, "uint");
      const bundleSeedToString = bundleStorageTokenAccountProgram[0].toString();
      const bundleStorageAccount = Keypair.fromSecretKey(uintSeed);
      const bundleStorageAccountKey = await PublicKey.findProgramAddress(
        [
          bundleStorageAccount.publicKey.toBuffer(),
        ],
        CONTRACT_PROGRAM_ID
      );

      const seed = signature.mint.toString().substr(0, 20);
      console.log(seed, "----seed----");
      const transferAcc = await PublicKey.createWithSeed(
        bundleStorageAccount.publicKey,
        seed,
        CONTRACT_PROGRAM_ID,
      );

      // BUNDLE STORAGE
      console.log(bundleStorageTokenAccountProgram[0], "bundleStorageTokenAccountProgram");
      console.log(bundleStorageAccount, "bundleStorageAccount");
      console.log(bundleSeedToString, "-----bundleSeedToString-----");
      console.log(bundleStorageAccountKey[0].toString(), "-----bundleStorageAccountKey-----");
      // console.log(transferAcc.toString(), "transferAcc");
      // const greetedAccount = await getSolanaInstance.value.getAccountInfo(transferAcc);
      // console.log(greetedAccount, "greetedAccount");
      const bundleStorageTokenAccountIx = SystemProgram.createAccountWithSeed({
        basePubkey: bundleStorageAccount.publicKey,
        fromPubkey: keyWallet,
        lamports: await getSolanaInstance.value.getMinimumBalanceForRentExemption(AccountLayout.span, "singleGossip"),
        newAccountPubkey: transferAcc,
        programId: CONTRACT_PROGRAM_ID,
        seed,
        space: 104,
      });

      console.log(bundleStorageTokenAccountIx, "bundleStorageTokenAccountIx");


      console.log(bundleStorageTokenAccountIx.keys[0].pubkey.toString(), "bundleStorageTokenAccountIx toString 0");
      console.log(bundleStorageTokenAccountIx.keys[1].pubkey.toString(), "bundleStorageTokenAccountIx toString 1");
      // console.log(bundleStorageTokenAccountIx.keys[2].pubkey.toString(), "bundleStorageTokenAccountIx toString 2");

      const programs_account_for_mint1 = Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        TokenMintAccountPubkey1,
        tempTokenAccount1.publicKey,
        bundleStorageTokenAccountProgram[0]
      );

      const programs_account_for_mint2 = Token.createInitAccountInstruction(
        TOKEN_PROGRAM_ID,
        TokenMintAccountPubkey2,
        tempTokenAccount2.publicKey,
        bundleStorageTokenAccountProgram[0]
      );
      console.log(signature, "signature mint");
      console.log(signature.mint.toString(), "signature mint");

      const superNFTTokenAccount = await PublicKey.findProgramAddress(
        [
          fromWallet.publicKey.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          signature.mint.toBuffer()
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      console.log(programs_account_for_mint2.keys[0].pubkey.toString(), "programs_account_for_mint2");
      console.log(programs_account_for_mint1.keys[0].pubkey.toString(), "programs_account_for_mint1");
      console.log(createTempTokenAccount1.keys[1].pubkey.toString(), "createTempTokenAccount1 toString 0");
      console.log(createTempTokenAccount2.keys[1].pubkey.toString(), "createTempTokenAccount2 toString 1");
      // const signatureAuthority = await actions.updateMetadata({
      //   connection,
      //   wallet: getSolanaWalletInstance.value,
      //   editionMint: signature.mint,
      //   newMetadataData: getNFTdeployResult.value,
      //   newUpdateAuthority: new PublicKey(0),
      //   primarySaleHappened: false,
      // });
      console.log(superNFTTokenAccount[0].toString(), "superNFTTokenAccount[0] mint");
      console.log(response, "NFT MINTED[0] mint");

      const keys =  [
        { pubkey: keyWallet, isSigner: true, isWritable: false },
        { pubkey: signature.mint, isSigner: false, isWritable: false },
        { pubkey: superNFTTokenAccount[0], isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: bundleStorageTokenAccountIx.keys[1].pubkey, isSigner: false, isWritable: true },
        { pubkey: BundleTokenAccount1[0], isSigner: false, isWritable: true },
        { pubkey: programs_account_for_mint1.keys[0].pubkey, isSigner: false, isWritable: true },
        { pubkey: BundleTokenAccount2[0], isSigner: false, isWritable: true },
        { pubkey: programs_account_for_mint2.keys[0].pubkey, isSigner: false, isWritable: true },
      ];

      const bundle_instruction_data = [0, bundleStorageTokenAccountProgram[1]];

      // data: [0, 254]
      console.log(bundle_instruction_data, "bundle_instruction_data.mint");

      const initEscrowIx = new TransactionInstruction({
        programId: CONTRACT_PROGRAM_ID,
        keys,
        data: Buffer.from(bundle_instruction_data)
      });
      console.log(initEscrowIx, "initEscrowIx.mint");

      const tx = new Transaction()
        .add(
          createTempTokenAccount1,
          createTempTokenAccount2,
          programs_account_for_mint1,
          programs_account_for_mint2,
          bundleStorageTokenAccountIx,
          initEscrowIx,
        );
      console.log("tx 1", tx);
      console.log(tempTokenAccount1, "tempTokenAccount1.mint");
      console.log(tempTokenAccount2, "tempTokenAccount2.mint");
      console.log(bundleStorageAccount.publicKey.toString(), "bundleStorageAccount.mint");
      const sendTx = await connection.sendTransaction(tx, [
        fullAccount,
        tempTokenAccount1,
        tempTokenAccount2,
        bundleStorageAccount,
      ], {skipPreflight: false, preflightCommitment: "singleGossip"});
      const response3 = await connection.confirmTransaction(sendTx, "processed");
      console.log("signature 1", sendTx);
      console.log("response3", response3);
      // store.dispatch("setStatus", StatusType.Minting);
      // const response = await connection.confirmTransaction(signature.txId, "processed");
      // console.log("response signature 2", response);

      if (response3.value && response3.value.err === null) {
        store.dispatch("setAllSolanaNFts");
        router.push({ name: "ChooseNFT"});
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
  }
};
// export default {
//   name: "AddEffectConfirm",

//   components: {
//     Spinner,
//     NavBar,
//     TokenCard,
//   },

//   data() {
//     return {
//       nftObj: {
//         metadata: {
//           title: "",
//           description: "",
//         },
//         token_id: [],
//       },
//       NFTData: {},
//       approvedNFTStatuses: [],
//     };
//   },

//   mixins: [StatusType],

//   computed: {
//     ...mapGetters([
//       "getAllNFTs",
//       "getNftsAreLoading",
//       "getStatus",
//       "getEffect",
//       "getDeployedPictureMeta",
//       "getContract",
//       "getBundleContract",
//       "getEffectsContract",
//       "getAccountId",
//     ]),
//     // if at least one nft is not approved, disabling btn
//     checkBundleForApprove() {
//       return this.approvedNFTStatuses.some((item) => item === false);
//     },
//     getNav() {
//       return [
//         {
//           text: "Back to Gallery",
//           name: "ChooseNFT",
//           params: null,
//         },
//       ];
//     },
//     NFTComputedData() {
//       return this.getAllNFTs.find((item) => item.token_id === this.$route.params.id);
//     },
//   },

//   watch: {
//     getAllNFTs: {
//       handler(value) {
//         const data = value.find((item) => item.token_id === this.$route.params.id);
//         if (this.getAllNFTs && data) {
//           this.NFTData = data;
//           this.nftObj.media = data.metadata.media;
//           this.passNFT(this.NFTComputedData.metadata);
//         }
//       },
//     },
//   },

//   mounted() {
//     this.setEffectChoice(this.$route.params.effectId);
//   },

//   methods: {
//     ...mapActions([
//       "setEffectChoice",
//       "setEffectResult",
//       "setDeployedPictureMeta",
//       "passNFT",
//       "createNewBundleNFT",
//     ]),
//     bundleStatusUpdate(data) {
//       this.approvedNFTStatuses.push(data);
//     },
//     // minting NFT with NEW effects
//     async handleMint() {
//       if (!this.nftObj.metadata.title) {
//         alert("Title field is empty");
//       } else {
//         try {
//           const effectObj = {
//             original: {
//               contract: this.getContract.contractId,
//               tokenId: this.NFTComputedData.token_id,
//               contentUrl: this.NFTComputedData.metadata.media,
//             },
//             modificator: {
//               contract: this.getEffectsContract.contractId,
//               tokenId: this.getEffect.token_id,
//               contentUrl: this.getEffect.metadata.media,
//             },
//             sender: this.getAccountId,
//           };

//           try {
//             await this.setEffectResult(effectObj);
//           } catch(err) {
//             console.log(err);
//             if (err instanceof AppError) {
//               throw err; 
//             } else {
//               throw SystemErrors.NFT_EFFECT_CONFIRM;
//             }
//           }


//           const bundleArr = [
//             {
//               data: this.NFTComputedData,
//               contract: "list",
//             },
//             {
//               data: this.getEffect,
//               contract: "effects",
//             }
//           ];

//           const bundlesArrApproved = bundleArr.map((item) => {
//             const obj = {
//               ...item.data,
//               contract: item.contract === "list" ? this.getContract.contractId : this.getEffectsContract.contractId,
//               approval_id: item.data.approved_account_ids[this.getBundleContract.contractId],
//             };

//             return obj;
//           });

//           // its calling bundle, because effect NFT combining with usual NFT


//           try {
//             await this.createNewBundleNFT({
//               token_id: `token-${Date.now()}`,
//               metadata: {
//                 title: this.nftObj.metadata.title,
//                 description: this.nftObj.metadata.description,
//                 media: this.getDeployedPictureMeta,
//                 copies: 1,
//               },
//               bundles: bundlesArrApproved,
//             });
//           } catch(err) {
//             console.log(err);
//             if (err instanceof AppError) {
//               throw err; 
//             } else {
//               throw SystemErrors.BUNDLE_NFTS;
//             }
//           }
//         } catch(err) {
//           if(err instanceof AppError) {
//             alert(err.message);
//           } else {
//             console.log(err);
//             alert("Undefined error");
//           }
//         }
//       }
//     },
//   },
// };
</script>
