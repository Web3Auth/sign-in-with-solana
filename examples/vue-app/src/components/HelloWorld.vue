<script lang="ts" setup>
import base58 from "bs58";
import swal from "sweetalert";
import { SIWS } from "@web3auth/sign-in-with-solana";
import {
  TorusWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletWalletAdapter,
  SlopeWalletAdapter,
  Coin98WalletAdapter,
} from "@solana/wallet-adapter-wallets";

import { ref } from "vue";

const selectedWallet = ref();

const allWallets = ref([
  new TorusWalletAdapter(),
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new SolletWalletAdapter(),
  new SlopeWalletAdapter(),
  new Coin98WalletAdapter(),
]);
const domain = window.location.host;
const origin = window.location.origin;
const publicKey = ref("");
const message = ref<string>();
const signature = ref<string>();
const showModal = ref(false);

function modalClick(item: any) {
  selectedWallet.value = item;
  showModal.value = false;
}

function createSolanaMessage(address: string, statement: string) {
  const siws = new SIWS({
    payload: {
      domain,
      address,
      statement,
      uri: origin,
      version: "1",
      chainId: 1,
      nonce: "1234132431",
      issuedAt: new Date().toISOString(),
    },
  });
  message.value = siws.prepareMessage();
  return message.value;
}

function connectWallet() {
  try {
    const wallet = selectedWallet.value;
    wallet.connect().then((resp: any) => {
      publicKey.value = wallet.publicKey?.toBase58() || "";
    });
  } catch (error) {
    console.log("User rejected the request." + error);
  }
}

async function signInWithSolana() {
  const wallet = selectedWallet.value;
  const message = createSolanaMessage(publicKey.value, "Sign in with Solana to the app.");
  const encodedMessage = new TextEncoder().encode(message);
  const signedMessage = await wallet.signMessage(encodedMessage);
  signature.value = base58.encode(signedMessage);
}

async function verifySignature() {
  const siws = new SIWS(message.value || "");
  try {
    if (!message.value) throw Error("invalid message");
    const resp = await siws.verify({ payload: siws.payload, signature: { t: "sip99", s: signature.value || "" } });
    swal("Success", "Verified", "success");
  } catch (e) {
    swal("Error", (e as Error).message, "error");
  }
}
function show() {
  showModal.value = true;
}
</script>

<template>
  <div id="app" class="main">
    <p class="sign center">Sign in With Solana</p>
    <br />
    <div>
      <button class="web3auth" @click="show">{{ selectedWallet ? selectedWallet.name : "Select Wallet" }}</button>
      <button class="web3auth" @click="connectWallet" :disabled="!selectedWallet">Connect wallet</button>
      <button class="web3auth" @click="signInWithSolana">Sign-in with Solana</button>

      <span v-if="publicKey" id="postSignIn">
        <p class="center">Public Key</p>
        <input class="publicKey" type="text" v-model="publicKey" />
        <p class="center">Signature</p>
        <input class="signature" type="text" v-model="signature" />
        <button class="web3auth" @click="verifySignature">Verify</button>
      </span>

      <p class="center">Created By</p>
      <img class="center logo" src="https://app.tor.us/v1.22.2/img/web3auth.b98a3302.svg" />
    </div>
  </div>
  <div v-if="showModal" class="walletmodel">
    <div v-for="item in allWallets" :key="item.name" @click="() => modalClick(item)"><img class="wicon" :src="item.icon" /> {{ item.name }}</div>
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem;
}
#console-wrapper {
  margin-top: auto;
}

#console {
  border: 1px solid black;
  height: 80px;
  padding: 2px;
  position: relative;
  text-align: left;
  width: 100%;
  border-radius: 5px;
  overflow: scroll;
}

#console > p {
  margin: 0.5em;
  word-wrap: break-word;
}
#font-italic {
  font-style: italic;
}
button {
  margin: 0 10px 10px 0;
}

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.break-word {
  overflow-wrap: break-word;
}

/*  */
body {
  background-image: url("https://web3auth.io/images/Group-427318217_1.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
}
.walletmodel {
  position: absolute;
  top: 0;
  z-index: 10;
}
.wicon {
  height: 20px;
}
.main {
  background-color: #ffffff;
  width: 400px;
  height: auto;
  margin: 7em auto;
  border-radius: 1.5em;
  box-shadow: 0px 11px 35px 2px rgba(0, 0, 0, 0.14);
}
.sign {
  padding-top: 40px;
  color: #8f9095;
  font-family: "DM Sans", sans-serif;
  font-weight: bold;
  font-size: 23px;
}
.web3auth {
  width: 76%;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  border: 1px solid #0364ff;
  background-color: #0364ff;
  padding: 10px 20px;
  box-sizing: border-box;
  margin-bottom: 50px;
  margin-left: 46px;
  text-align: center;
  margin-bottom: 27px;
  text-transform: none;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 400ms ease;
  font-family: "DM Sans", sans-serif;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
}
.signature,
.publicKey {
  width: 76%;
  color: rgb(38, 50, 56);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  background: rgba(136, 126, 126, 0.04);
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  outline: none;
  box-sizing: border-box;
  border: 2px solid rgba(0, 0, 0, 0.02);
  margin-bottom: 50px;
  margin-left: 46px;
  text-align: center;
  margin-bottom: 27px;
  font-family: "Ubuntu", sans-serif;
}

.logo {
  width: 76%;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1px;
  padding: 10px 20px;
  box-sizing: border-box;
  margin-bottom: 50px;
  margin-left: 46px;
  text-align: center;
  margin-bottom: 27px;
  text-transform: none;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 400ms ease;
  font-family: "DM Sans", sans-serif;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
}
.web3auth:focus {
  border: 2px solid rgba(0, 0, 0, 0.18) !important;
}
p {
  text-shadow: 0px 0px 3px rgba(117, 117, 117, 0.12);
  color: #8f9095;
  text-decoration: none;
}
</style>
