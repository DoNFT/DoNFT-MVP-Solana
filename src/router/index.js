import { createRouter, createWebHistory } from "vue-router";
// import store from "@/store";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network: "devnet" }),
  ],
  autoConnect: true,
};

import { initWallet, useWallet } from "solana-wallets-vue";
initWallet(walletOptions);

const { connecting, connected } = useWallet();

const routes = [
  {
    path: "/",
    name: "home",
    redirect: { name: "ChooseNFT" },
  },
  {
    path: "/login",
    name: "LoginView",
    component: () => import(/* webpackChunkName: "LoginView" */ "@/views/LoginView.vue"),
    meta: { title: "Do[NFT]" },
  },
  {
    path: "/create_nft",
    name: "CreateNFT",
    component: () => import(/* webpackChunkName: "CreateNFT" */ "@/views/CreateNFT.vue"),
    meta: { title: "Do[NFT]", requiresAuth: true }
  },
  {
    path: "/choose_nft",
    name: "ChooseNFT",
    meta: { title: "Do[NFT]", requiresAuth: true },
    component: () => import(/* webpackChunkName: "ChooseNFT" */ "@/views/ChooseNFT.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeResolve((to, _from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // todo: try to change to a better checking? currently, this is most stable way
  // to get info about auth of user, other things do not work, as it too early for plugin
  // https://github.com/lorisleiva/solana-wallets-vue?ref=vuejsexamples.com
  const user = connecting.value || connected.value;

  if (requiresAuth && !user) {
    next("/login");
  } else {
    next();
  }
});

export default router;
