import {
    useConnection,
    useWallet
} from '@solana/wallet-adapter-react';
import {
    WalletDisconnectButton, WalletModalProvider, WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import React from 'react';

const MyWallet: React.FC = () => {
    const { connection } = useConnection();
    let walletAddress = "";

    // if you use anchor, use the anchor hook instead
    // const wallet = useAnchorWallet();
    // const walletAddress = wallet?.publicKey.toString();

    const wallet = useWallet();
    if (wallet.connected && wallet.publicKey) {
        walletAddress = wallet.publicKey.toString()
    }

    return (
        <>
            {wallet.connected &&
                
                <span>
                <p className='center'>Public Key</p>
                <input className='publicKey' type="text" id="publicKey" value={walletAddress}/>
              </span>
            }
            
                    {wallet.connected && <WalletDisconnectButton className='web3auth' /> ||
                    <WalletModalProvider >
                        <WalletMultiButton className='web3auth' />
                        </WalletModalProvider>
                    }
        </>
    );
};

export default MyWallet;
