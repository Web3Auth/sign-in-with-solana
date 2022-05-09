import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { FC, ReactNode, useMemo } from 'react';
import MyWallet from './MyWallet';
import SignIn from './SignIn';

export const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Mainnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
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
};

const Content: FC = () => {
    return <WalletMultiButton />;
};

