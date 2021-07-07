# polka-signer
this code is some examples for how to sign offline.

* [txByCustSign.ts](https://github.com/polariseye/polka-signer/txByCustSign.ts) is the best way to sign off line. and the payload can be construct repeatedly. this code is refer to the polka issue [1421](https://github.com/polkadot-js/api/issues/1421)

* [txBySignner.ts](https://github.com/polariseye/polka-signer/txBySignner.ts) is refer to the [signer tool](https://github.com/polkadot-js/tools/tree/master/packages/signer-cli). it can change the way to sign freely and it's so simple

if you don't mind using heavyweight lib. the package https://github.com/paritytech/txwrapper may be a good choice also