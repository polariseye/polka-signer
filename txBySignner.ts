/*
    the code is refer to https://github.com/polkadot-js/tools/tree/master/packages/signer-cli
*/
import type { Signer, SignerResult } from '@polkadot/api/types';
import type { SignerPayloadRaw } from '@polkadot/types/types';
import { KeyringPair } from "@polkadot/keyring/types";
import { assert, isHex,u8aToHex } from '@polkadot/util';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise,WsProvider } from "@polkadot/api";
import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from "@polkadot/keyring";
import type { SignerOptions } from '@polkadot/api/submittable/types';

export default class RawSigner implements Signer {
    alice:KeyringPair ;
    constructor(alice:KeyringPair){
        this.alice=alice;
    }
    public async signRaw ({ data }: SignerPayloadRaw): Promise<SignerResult> {
        // construct the data to sign
        const hashed = (data.length > (256 + 1) * 2)
        ? blake2AsHex(data)
        : data;
        console.log(`unsigned:${data}`)
    
        // refer to https://github.com/polkadot-js/tools/issues/175
        // For the Substrate signatures (MultiSiginature type) it is always 65/66 bytes in length. The first byte is always 00, 01 or 02, (00 = ed25519, 01 = sr25519, 02 = ecdsa), the reaming bytes contain the actual signature data. (64 following for sr/ed, 65 for ecdsa)
        let sigVal = this.alice.sign(hashed);
        let actualSign = new Uint8Array(sigVal.byteLength+1)
        actualSign[0] = 0x1; // i use sr25519.so the first byte is 1.it refer to https://github.com/polkadot-js/api/blob/master/packages/types/src/interfaces/extrinsics/definitions.ts#L31
        actualSign.set(sigVal, 1);

        console.log("signature:",u8aToHex(actualSign))
        return {id:1, signature:u8aToHex(actualSign)};       
  }
}

async function main() {
    await cryptoWaitReady(); // wait sr25519 init finish

    const wsProvider = new WsProvider('wss://westend-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });

    let keyring= new Keyring({
        type:"sr25519",
    });
    const Alice = keyring.addFromUri("//Alice"); // get default develop account

    let from = Alice.address;
    let to = "5H2Dq1m8Cg7qsMaADCxnPDf3mk3CePDiVdVF6nyNeRbKWjc3";
    let amount = BigInt(12345);

    const options: Partial<SignerOptions> = { signer: new RawSigner(Alice) };

    const accountInfo = await api.query.system.account(from);
    let signedBlock= await api.rpc.chain.getBlock();

    options.nonce = accountInfo.nonce;
    options.blockHash = signedBlock.hash;    
    options.era=0;

    const tx = api.tx.balances.transfer(to, amount);
    let signResult = await tx.signAsync(from,options);
    console.log(`tx:${signResult.hash}`)

    let remoteHash= await signResult.send()
    console.log(`commit finish tx:${remoteHash}`)
}

main().catch(console.log).finally(()=>{ console.log("finished") })