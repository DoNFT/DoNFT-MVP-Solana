import { createStore } from "vuex";

import {
  deployNFTtoIPFS,
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
    status: StatusType.ChoosingParameters,
  },
  mutations: {
    setStatus (state, status) {
      state.status = status;
    },
    setIpfs (state, ipfsInstance) {
      state.ipfs = ipfsInstance;
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
    setStatus ({commit}, status) {
      commit("setStatus", status);
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
  },
  getters: {
    getIpfs: state => state.ipfs,
    getNFTdeployResult: state => state.deployedNFT,
    getDialogWalletStatus: (state) => state.solanaDialogOpenStatus,
    getWalletConnection: (state) => state.solanaWalletConnected,
    getWalletAddress: (state) => state.solanaWalletAddress,
    getSolanaInstance: (state) => state.solanaInstance,
    getSolanaWalletInstance: (state) => state.solanaWalletInstance,
    getStatus: state => state.status,
  },
});
