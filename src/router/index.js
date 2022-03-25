import { createRouter, createWebHistory } from "vue-router";
import { initWallet, useWallet } from "solana-wallets-vue";
import store from "@/store";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

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

// its here for using router push
const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network: "devnet" }),
  ],
  autoConnect: true,
  onError: (errorData) => {
    // Error of rejecting on auth
    console.log(router, "router");
    if (errorData.error && errorData.error.code === 4001) {
      console.log(errorData, "Errordata2");
      router.push({ name: "LoginView"});
    } 
  }
};

initWallet(walletOptions);

const { connecting, connected, disconnecting, wallet } = useWallet();

router.beforeEach(async (to, _from, next) => {
  // wallet.value._events.onReadyStateChange(() => console.log("READY STATE"));
  // console.log(ready, "wallet.value.readyState");
  if (wallet.value) {
    store.dispatch("setSolanaWalletInstance", wallet.value);
  }

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  console.log(connected.value, "connected");
  console.log(connecting.value, "connecting");
  console.log(disconnecting.value, "disconnecting");
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
