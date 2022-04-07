const { defineConfig } = require("@vue/cli-service");

// there is conflicts in Solana's packages with vue js 3, util/, stream/ package resolving them
// problem: https://stackoverflow.com/questions/64402821/module-not-found-error-cant-resolve-util-in-webpack
module.exports = defineConfig({
    transpileDependencies: true,
    chainWebpack: config => {
        config.module.rules.delete("svg");
    },
    configureWebpack: {
        resolve: {
            fallback: {
                util: require.resolve("util"),
                stream: require.resolve("stream-browserify"),
                crypto: require.resolve("crypto-browserify"),
            }
        },
        module: {
            rules: [{
                test: /\.svg$/,
                loader: "vue-svg-loader"
            }]
        }
    },
});