import { ApiPromise,WsProvider } from "@polkadot/api";
import * as polka_util from "@polkadot/util";
import { Keyring } from "@polkadot/keyring";
import { KeyringPair } from "@polkadot/keyring/types";
import { blake2AsHex,decodeAddress } from '@polkadot/util-crypto';
import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto';

/* 
    the code can refer to https://github.com/polkadot-js/api/issues/1421
    and it will not work by the refer code. i change the sign detail code
*/
async function main(){ 
    await cryptoWaitReady(); // wait sr25519 init finish

    const wsProvider = new WsProvider('wss://westend-rpc.polkadot.io'); // wss://rococo-rpc.polkadot.io
    const api = await ApiPromise.create({ provider: wsProvider });

    console.log("start handle");

    let keyring= new Keyring({
        type:"sr25519",
    });
    const Alice = keyring.addFromUri("//Alice"); // get default develop account
    let from = Alice.address;
    let to = "5H2Dq1m8Cg7qsMaADCxnPDf3mk3CePDiVdVF6nyNeRbKWjc3";
    let amount = BigInt(12345);
    
    const tx = api.tx.balances.transfer(to, amount);
    const accountInfo = await api.query.system.account(from) ;
    console.log(`nonce:${JSON.stringify( accountInfo)}`)

    let signedBlock = await api.rpc.chain.getBlock();
    // create the payload
    const signer = api.createType('SignerPayload', {
        blockHash:  signedBlock.hash.toString(),
        genesisHash: api.genesisHash.toString(),
        nonce:accountInfo.nonce,
        runtimeVersion: api.runtimeVersion,
        address:from,
        blockNumber:signedBlock.block.header.number.toString(),
        method: tx,
        version: api.extrinsicVersion,
    });

  try {
    // the below code do not work.
    //const { signature } = api.createType('ExtrinsicPayload', signer.toPayload(), { version: api.extrinsicVersion }).sign(Alice);
    //console.log(`sign:${signature}`)

    // refer to https://github.com/polkadot-js/tools/issues/175
    // For the Substrate signatures (MultiSiginature type) it is always 65/66 bytes in length. The first byte is always 00, 01 or 02, (00 = ed25519, 01 = sr25519, 02 = ecdsa), the reaming bytes contain the actual signature data. (64 following for sr/ed, 65 for ecdsa)
    let unsignedDetail = signer.toRaw();
    const hashed = (unsignedDetail.data.length > (256 + 1) * 2)
        ? blake2AsHex(unsignedDetail.data)
        : unsignedDetail.data;
    console.log(`address ${Alice.address} unsigned:${hashed}`)

    let sigVal = Alice.sign(hashed);
    let newVal = new Uint8Array(sigVal.byteLength+1)
    newVal[0] = 0x1; // i use sr25519.so the first byte is 1.it refer to https://github.com/polkadot-js/api/blob/master/packages/types/src/interfaces/extrinsics/definitions.ts#L31
    newVal.set(sigVal,1);

    tx.addSignature(from, newVal, signer.toPayload());

    console.log(await tx.send());
  } catch (error) {
      console.error(error);
  }  
}
main().catch(console.error).finally(() => process.exit());
