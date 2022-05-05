import swal from "sweetalert";
import { Header, Payload, SIWS } from "@web3auth/sign-in-with-solana";
// Domain and origin
const domain = window.location.host;
const origin = window.location.origin;

// Nonce, public key and other global variables
let nonce = "";
let publicKey = "";
let message;

// Generate a message for signing
// The nonce is generated on the server side 
function createSolanaMessage(address, statement) {
    
    const header = new Header();
    header.t = "sip99"
    const payload = new Payload();
    payload.domain = domain;
    payload.address = address;
    payload.uri = origin;
    payload.statement = statement;
    payload.version = '1';
    payload.chainId = '1';
    message = new SIWS({
        header,
        payload
    });
    // we need the nonce for verification so getting it in a global variable
    nonce = message.nonce;
    // Returning the prepared message
    return message.prepareMessage();
}

// Connect the solana wallet 
// Tested with Phantom
function connectWallet() {
    try {
        window.solana.connect().then(resp => {
            // Successful connection
            // Get the publicKey (string)
            publicKey = resp.publicKey.toString();
        })
    } catch(error) {
        console.log('User rejected the request.' + error);
    };
}

// Perform the sign in with Solana
// This function does the following
// calls the createSolanaMessage, 
// encodes that message and then
// creates a browser signin request
async function signInWithSolana() {
    const message = createSolanaMessage(
        publicKey,
        'Sign in with Solana to the app.'
    );
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await window.solana.request({
        method: "signMessage",
        params: {
             message: encodedMessage,
             display: "text",
        },
    });
    document.getElementById('postSignIn').style = "display:block";
    document.getElementById('signature').value = signedMessage.signature;
    document.getElementById('publicKey').value = signedMessage.publicKey;
}

// Verify Signature allows users to test
// if their signature is valid 
async function verifySignature() {
    const signatureString = document.getElementById("signature").value;
    const publicKey = document.getElementById("publicKey").value;
    const signature = {
        t: "sip99",
        s: signatureString
    }
    const payload = message.payload;
    payload.address = publicKey;
    const resp = await message.verify({ payload,signature });
    if (resp.success == true) {
        swal("Success","Signature Verified","success")
    } else {
        swal("Error",resp.error.type,"error")
    }
}

/*
Creating CID
async function createCID() {
    const {bytes, cid} = await message.createCID(JSON.stringify(message));
    swal("CID base64 encoded",cid.toString(base64.encoder),"info")
    // To decode the block use from the bytes
    // await message.decodeBlock(bytes)
}
*/

// On-load, connect the wallet
window.addEventListener('load', function() {
    connectWallet();
})


const connectWalletBtn = document.getElementById('connectWalletBtn');
const w3aBtn = document.getElementById('w3aBtn');
const verifyBtn = document.getElementById('verify');
const cidBtn = document.getElementById('cid');
verifyBtn.onclick = verifySignature;
connectWalletBtn.onclick = connectWallet;
w3aBtn.onclick = signInWithSolana;
