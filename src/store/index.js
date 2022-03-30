import { createStore } from "vuex";

import {
  deployNFTtoIPFS,
  loadAllNFTs,
  getImageForTokenByURI,
} from "@/solana_utilities";

import {StatusType, getIPFS} from "@/utilities";

export default createStore({
  state: {
    ipfs: null,
    deployedNFT: null,
    solanaDialogOpenStatus: false,
    solanaWalletConnected: false,
    solanaWalletAddress: null,
    solanaInstance: null,
    solanaWalletInstance: null,
    loadingNFTs: false,
    status: StatusType.ChoosingParameters,
    allNFTs: [],
    currentNFT: {},
  },
  mutations: {
    setStatus (state, status) {
      state.status = status;
    },
    setIpfs (state, ipfsInstance) {
      state.ipfs = ipfsInstance;
    },
    SET_LOADING_NFTS (state, payload) {
      state.loadingNFTs = payload;
    },
    SET_ALL_NFTS(state, payload) {
      state.allNFTs = payload;
    },
    // for single NFT pages, extra info about NFT
    SET_CURRENT_NFT(state, payload) {
      state.currentNFT = payload;
    },
    SET_CONNECTED(state, address) {
      state.solanaWalletConnected = true;
      state.solanaWalletAddress = address;
      sessionStorage.setItem("solana_wallet_address", address);
    },
    SET_DEPLOYED_NFT(state, payload) {
      state.deployedNFT = payload;
    },
    SET_WALLET_DIALOG(state, data) {
      state.solanaDialogOpenStatus = data;
    },
    SET_WALLET_DISCONNECTED(state) {
      state.solanaWalletConnected = false;
      state.solanaWalletAddress = null;
      state.solanaInstance = null;
      state.solanaWalletInstance = null;
      sessionStorage.removeItem("solana_wallet_address", null);
    },
    SET_SOLANA_INSTANCE(state, payload) {
      state.solanaInstance = payload;
    },
    SET_CURRENT_WALLET(state, payload) {
      state.solanaWalletInstance = payload;
    },
  },
  actions: {
    async setIpfs ({commit}) {
      const ipfs = await getIPFS();
      commit("setIpfs", await ipfs.create());
    },
    async setDeployToIPFS ({commit, getters}, meta) {
      // dispatch('setStatus', StatusType.DeployingToIPFS)
      console.log(meta, "META");
      commit("SET_DEPLOYED_NFT", await deployNFTtoIPFS(getters.getIpfs, meta));
    },
    // solana storage a little different with NEAR
    // data of NFT storing link to IPFS with extra data, where are METAPLEX fields stored with image
    // after loading METAPLEX data, we can get real image address
    async setTokenImage ({getters}, token) {
      let url = token.uri;
      let data = null;

      if (getters.getIpfs) {
        data = await getImageForTokenByURI(getters.getIpfs, url);
      }

      return data;
    },
    setStatus ({commit}, status) {
      commit("setStatus", status);
    },
    setCurrentNFTdata ({commit}, payload) {
      commit("SET_CURRENT_NFT", payload);
    },
    setWalletDisconnected ({commit}) {
      commit("SET_WALLET_DISCONNECTED");
    },
    setConnected({commit}, payload) {
      commit("SET_CONNECTED", payload);
    },
    setSolanaInstance ({commit}, payload) {
      commit("SET_SOLANA_INSTANCE", payload);
    },
    setSolanaWalletInstance ({commit}, payload) {
      commit("SET_CURRENT_WALLET", payload);
    },
    async setAllSolanaNFts ({commit, getters}) {
      commit("SET_LOADING_NFTS", true);
      commit("SET_ALL_NFTS", await loadAllNFTs(getters.getSolanaInstance, getters.getSolanaWalletInstance));
      commit("SET_LOADING_NFTS", false);
    },
  },
  getters: {
    getIpfs: state => state.ipfs,
    getNFTdeployResult: state => state.deployedNFT,
    getAllNFTs: state => state.allNFTs,
    getDialogWalletStatus: (state) => state.solanaDialogOpenStatus,
    getWalletConnection: (state) => state.solanaWalletConnected,
    getWalletAddress: (state) => state.solanaWalletAddress,
    getSolanaInstance: (state) => state.solanaInstance,
    getSolanaWalletInstance: (state) => state.solanaWalletInstance,
    getStatus: state => state.status,
    getCurrentNFT: state => state.currentNFT,
    getLoadingNFTsStatus: state => state.loadingNFTs,
  },
});
