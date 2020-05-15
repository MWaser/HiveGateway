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
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('./config');
const app = global.app;
var hive = app.get('hive');
var steem = app.get('steem');
const gbaToken = require("../build/contracts/GBAToken.json");
const Web3 = require('web3');
var web3 = new Web3(config.addrCurr);
const account = web3.eth.accounts.privateKeyToAccount('0x' + config.privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
config.tokens.forEach((token) => config.tokens[token].contract = new web3.eth.Contract(gbaToken.abi, token.address, { data: gbaToken.bytecode }));
console.log(config.tokens);
// ******************************************************************************************
// Watching PoA Ethereum blockchain & taking actions on Hive or Steem
function ethHandler(token, event) {
    const retVals = event.returnValues;
    console.log("ETHEREUM " + retVals.from + " transferred " + (retVals.value / token.decimals) + " of " + token.symbol + " tokens to " +
        retVals.to + " - " + retVals.memo);
    if (retVals.to == config.address) {
        let amount = (retVals.value / token.decimals).toString();
        var json = JSON.stringify({ contractName: "tokens", contractAction: "transfer",
            contractPayload: { symbol: token.symbol, to: retVals.destAddr, quantity: amount, memo: retVals.memo }
        });
        if (retVals.blockchain == 'Hive')
            hive.broadcast.customJson(config.activeWif, [config.hsName], [], 'ssc-mainnet1', json, (err, result) => {
                console.log(err, result);
            });
        else
            steem.broadcast.customJson(config.activeWif, [config.hsName], [], 'ssc-mainnet1', json, (err, result) => {
                console.log(err, result);
            });
    }
}
exports.ethHandler = ethHandler;
function ethWatcher(token) {
    return __awaiter(this, void 0, void 0, function* () {
        token.getPastEvents('OurTransfer', { fromBlock: 0, toBlock: 'latest' }, (events) => {
            console.log("ETHEREUM past events " + JSON.stringify(events));
            events.forEach((event) => { ethHandler(token, event); });
        });
        // token.events.OurTransfer({ fromBlock: 0 }, (event) => { eHandler(error, event); });
    });
}
exports.ethWatcher = ethWatcher;
// ******************************************************************************************
// Watching Hive & Steem blockchains & taking actions on PoA Ethereum
function hsHandler(res, x) {
    if (config.hsTokens.include(x.contractPayload.symbol)) {
        const vars = x.contractPayload;
        console.log("STEEM " + res.required_auths + " transferred " +
            vars.quantity + " " + vars.symbol +
            " tokens to " + vars.to + " - " + vars.memo);
        if (vars.to == config.hsName) {
            const amount = vars.quantity * config.token[x.contractPayload.symbol].decimals;
            config.tokens[x.contractPayload.symbol].contract.methods.approve(config.address, amount)
                .send({ from: config.address })
                .on('receipt', function (receipt) { console.log(receipt); })
                .on('error', console.error);
            config.tokens[x.contractPayload.symbol].contract.methods.ourTransferFrom(config.address, vars.memo, amount, "from Steem")
                .send({ from: config.address })
                .on('receipt', function (receipt) { console.log(receipt); })
                .on('error', console.error);
        }
    }
}
exports.hsHandler = hsHandler;
//# sourceMappingURL=hsGateway.js.map