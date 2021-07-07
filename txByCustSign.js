"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var api_1 = require("@polkadot/api");
var keyring_1 = require("@polkadot/keyring");
var util_crypto_1 = require("@polkadot/util-crypto");
var util_crypto_2 = require("@polkadot/util-crypto");
/*
    the code can refer to https://github.com/polkadot-js/api/issues/1421
    and it will not work by the refer code. i change the sign detail code
*/
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var wsProvider, api, keyring, Alice, from, to, amount, tx, accountInfo, signedBlock, signer, unsignedDetail, hashed, sigVal, newVal, _a, _b, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, util_crypto_2.cryptoWaitReady()];
                case 1:
                    _c.sent(); // wait sr25519 init finish
                    wsProvider = new api_1.WsProvider('wss://westend-rpc.polkadot.io');
                    return [4 /*yield*/, api_1.ApiPromise.create({ provider: wsProvider })];
                case 2:
                    api = _c.sent();
                    console.log("start handle");
                    keyring = new keyring_1.Keyring({
                        type: "sr25519"
                    });
                    Alice = keyring.addFromUri("//Alice");
                    from = Alice.address;
                    to = "5H2Dq1m8Cg7qsMaADCxnPDf3mk3CePDiVdVF6nyNeRbKWjc3";
                    amount = BigInt(12345);
                    tx = api.tx.balances.transfer(to, amount);
                    return [4 /*yield*/, api.query.system.account(from)];
                case 3:
                    accountInfo = _c.sent();
                    console.log("nonce:" + JSON.stringify(accountInfo));
                    return [4 /*yield*/, api.rpc.chain.getBlock()];
                case 4:
                    signedBlock = _c.sent();
                    signer = api.createType('SignerPayload', {
                        blockHash: signedBlock.hash.toString(),
                        genesisHash: api.genesisHash.toString(),
                        nonce: accountInfo.nonce,
                        runtimeVersion: api.runtimeVersion,
                        address: from,
                        blockNumber: signedBlock.block.header.number.toString(),
                        method: tx,
                        version: api.extrinsicVersion
                    });
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 7, , 8]);
                    unsignedDetail = signer.toRaw();
                    hashed = (unsignedDetail.data.length > (256 + 1) * 2)
                        ? util_crypto_1.blake2AsHex(unsignedDetail.data)
                        : unsignedDetail.data;
                    console.log("address " + Alice.address + " unsigned:" + hashed);
                    sigVal = Alice.sign(hashed);
                    newVal = new Uint8Array(sigVal.byteLength + 1);
                    newVal[0] = 0x1; // i use sr25519.so the first byte is 1.it refer to https://github.com/polkadot-js/api/blob/master/packages/types/src/interfaces/extrinsics/definitions.ts#L31
                    newVal.set(sigVal, 1);
                    tx.addSignature(from, newVal, signer.toPayload());
                    _b = (_a = console).log;
                    return [4 /*yield*/, tx.send()];
                case 6:
                    _b.apply(_a, [_c.sent()]);
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _c.sent();
                    console.error(error_1);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
main()["catch"](console.error)["finally"](function () { return process.exit(); });
