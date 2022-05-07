import React from "react";
import "./App.css";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import {
  getLedgerWallet,
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletExtensionWallet,
  getSolletWallet
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import MyWallet from "./MyWallet";
import SignIn from "./SignIn";

function App() {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint
  const endpoint = React.useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking --
  // Only the wallets you configure here will be compiled into your application
  const wallets = React.useMemo(
    () => [
      getPhantomWallet(),
      getSlopeWallet(),
      getSolflareWallet(),
      getLedgerWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
      <div className="main">
          <p className="sign">Sign in With Solana</p>
         <br/>
         <div>
         <MyWallet />
          <SignIn/>
          <span id="postSignIn" style={{ display: "none" }}>
            <p>Public Key</p>
            <input className='publicKey' type="text" id="publicKey"/>
            <p>Signature</p>
            <input className='signature' type="text" id="signature" />
            <button className='web3auth' id='verify'>Verify</button>
          </span>
          <p className="center">Created By</p>
          <img className='logo' src="https://app.tor.us/v1.22.2/img/web3auth.b98a3302.svg"/>
         </div>
      </div>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
