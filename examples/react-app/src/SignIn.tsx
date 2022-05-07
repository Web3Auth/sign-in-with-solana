import {
    useWallet
} from '@solana/wallet-adapter-react';
import { Payload, SIWS } from '@web3auth/sign-in-with-solana';
import bs58 from 'bs58';
import { useState } from 'react';
import swal from 'sweetalert';


const SignIn = () => {

    
    const { publicKey, signMessage } = useWallet();
    
    // Domain and origin
    const domain = window.location.host;
    const origin = window.location.origin;

    
    let statement = "Sign in with Solana to the app.";

    const [siwsMessage, setSiwsMessage] = useState<SIWS>();
    const [nonce, setNonce] = useState("");
    const [sign, setSignature] = useState("");

    // Generate a message for signing
    // The nonce is generated on the server side 
    function createSolanaMessage() {
        
        const payload = new Payload();
        payload.domain = domain;
        
        payload.address = publicKey!.toString();
        payload.uri = origin;
        payload.statement = statement;
        payload.version = '1';
        payload.chainId = 1;
        
        let message = new SIWS({ payload });

        // we need the nonce for verification so getting it in a global variable
        setNonce(message.payload.nonce);
        setSiwsMessage(message);
        const messageText = message.prepareMessage();
        const messageEncoded = new TextEncoder().encode(messageText);
        signMessage!(messageEncoded).then(resp => setSignature(
            bs58.encode(resp)));
    }
    
    return (
        <>
            <button className='web3auth' id='w3aBtn' onClick={createSolanaMessage}>Sign-in with Solana</button>
            {
                sign &&
                <>
                    <input className='signature' type="text" id="signature" value={sign} onChange={ e=> setSignature(e.target.value)} />
                    <button className='web3auth' id='verify' onClick={e => {
                        const signature = {
                            t: "sip99",
                            s: sign
                        } 
                        const payload = siwsMessage!.payload;
                        siwsMessage!.verify({ payload, signature }).then(resp => {
                            if (resp.success == true) {
                                swal("Success","Signature Verified","success")
                            } else {
                                swal("Error",resp.error!.type,"error")
                            }
                        });
                    }}>Verify</button>
                </>
            }
        </>
    );
};

export default SignIn;
