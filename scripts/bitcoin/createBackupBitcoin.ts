import { Psbt } from "bitcoinjs-lib/src/psbt";
const privateKey = process.env.PRIVATE_KEY; // owner of funds
const recipient = process.env.RECIPIENT_ADDRESS; // recipient of the funds (if invoked), this could be your exchange account for example
const notValidBefore = process.env.NOT_VALID_BEFORE; // timestamp specifying when this transaction becomes valid
const value = process.env.VALUE; // owner of funds
const bip65 = require('bip65');
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import { hash160, sha256 } from "bitcoinjs-lib/src/crypto";
const ECPair = ECPairFactory(ecc);
const request = require("superagent");

async function main() {
    const key = ECPair.fromPrivateKey(Buffer.from(new Uint8Array(privateKey)));
    const address = hash160(sha256(<Buffer>key.getPublicKey?.()));
    const inputs = await getUnspentInputs(address);
    const lockTime = bip65.encode({ utc: notValidBefore });
    const tx = new Psbt()
        .addInputs(inputs)
        .addOutput({ address: recipient, value: value })
        .setLocktime(lockTime)
        .signAllInputs(key);

    return tx.toHex();
}

async function getUnspentInputs(address) {
    const data = await request.get(`https://blockchain.info/unspent?active=${address}`);

    return data.body.unspent_outputs.map((tx) => {
        return {
            hash: tx.tx_hash,
            index: tx.tx_index,
        }
    });
}

main().then((tx) => {
    console.log("BACKUPS COMPLETE, PLEASE SAVE THE DATA BELOW:\n");
    console.log(tx);
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exitCode = 1;
});