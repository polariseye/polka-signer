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
var util_1 = require("@polkadot/util");
var util_crypto_1 = require("@polkadot/util-crypto");
var api_1 = require("@polkadot/api");
var util_crypto_2 = require("@polkadot/util-crypto");
var keyring_1 = require("@polkadot/keyring");
var RawSigner = /** @class */ (function () {
    function RawSigner(alice) {
        this.alice = alice;
    }
    RawSigner.prototype.signRaw = function (_a) {
        var data = _a.data;
        return __awaiter(this, void 0, void 0, function () {
            var hashed, sigVal, actualSign;
            return __generator(this, function (_b) {
                hashed = (data.length > (256 + 1) * 2)
                    ? util_crypto_1.blake2AsHex(data)
                    : data;
                console.log("unsigned:" + data);
                sigVal = this.alice.sign(hashed);
                actualSign = new Uint8Array(sigVal.byteLength + 1);
                actualSign[0] = 0x1; // i use sr25519.so the first byte is 1.it refer to https://github.com/polkadot-js/api/blob/master/packages/types/src/interfaces/extrinsics/definitions.ts#L31
                actualSign.set(sigVal, 1);
                console.log("signature:", util_1.u8aToHex(actualSign));
                return [2 /*return*/, { id: 1, signature: util_1.u8aToHex(actualSign) }];
            });
        });
    };
    return RawSigner;
}());
exports["default"] = RawSigner;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var wsProvider, api, keyring, Alice, from, to, amount, options, accountInfo, signedBlock, tx, signResult, remoteHash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, util_crypto_2.cryptoWaitReady()];
                case 1:
                    _a.sent(); // wait sr25519 init finish
                    wsProvider = new api_1.WsProvider('wss://westend-rpc.polkadot.io');
                    return [4 /*yield*/, api_1.ApiPromise.create({ provider: wsProvider })];
                case 2:
                    api = _a.sent();
                    keyring = new keyring_1.Keyring({
                        type: "sr25519"
                    });
                    Alice = keyring.addFromUri("//Alice");
                    from = Alice.address;
                    to = "5H2Dq1m8Cg7qsMaADCxnPDf3mk3CePDiVdVF6nyNeRbKWjc3";
                    amount = BigInt(12345);
                    options = { signer: new RawSigner(Alice) };
                    return [4 /*yield*/, api.query.system.account(from)];
                case 3:
                    accountInfo = _a.sent();
                    return [4 /*yield*/, api.rpc.chain.getBlock()];
                case 4:
                    signedBlock = _a.sent();
                    options.nonce = accountInfo.nonce;
                    options.blockHash = signedBlock.hash;
                    options.era = 0;
                    tx = api.tx.balances.transfer(to, amount);
                    return [4 /*yield*/, tx.signAsync(from, options)];
                case 5:
                    signResult = _a.sent();
                    console.log("tx:" + signResult.hash);
                    return [4 /*yield*/, signResult.send()];
                case 6:
                    remoteHash = _a.sent();
                    console.log("commit finish tx:" + remoteHash);
                    return [2 /*return*/];
            }
        });
    });
}
main()["catch"](console.log)["finally"](function () { console.log("finished"); });
