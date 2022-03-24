import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store";
import connection from "@/solanaInit";
import "solana-wallets-vue/styles.css";
import IconComponent from "@/components/IconComponent/Icon";


store.dispatch("setSolanaInstance", connection);

const app = createApp(App)
  .use(store)
  .use(router)
  .component("IconComponent", IconComponent);

app.mount("#app");