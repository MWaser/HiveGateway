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
const tedious = require('tedious');
const config = require('../config');
const app = global.app;
var hive = app.get('hive');
var steem = app.get('steem');
const te = app.get('te');
const taskQ = app.get('taskQ');
const gbaToken = require("../build/contracts/GBAToken.json");
const Web3 = require('web3');
var web3 = new Web3(config.addrCurr);
const account = web3.eth.accounts.privateKeyToAccount('0x' + config.privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
config.tokens.forEach((token) => config.token[token].contract = new web3.eth.Contract(gbaToken.abi, config.token[token].address, { data: gbaToken.bytecode }));
// ******************************************************************************************
// Watching PoA Ethereum blockchain & taking actions on Hive or Steem
function write2Db(token, event) {
    return __awaiter(this, void 0, void 0, function* () {
        let memo = event.returnValues.memo ? event.returnValues.memo : '';
        let destChain = event.returnValues.blockchain ? event.returnValues.blockchain : '';
        let destAddr = event.returnValues.destAddr ? event.returnValues.destAddr : '';
        try {
            let query = "exec spTokenEventH @pTxHash, @pEvent, @pToken, @pFromChain, @pFromBlock, @pFromAddr, ";
            query += "@pToAddr, @pValue, @pMemo, @pClaimBy, @pClaimBlock, @pFee, @pDestChain, @pDestBlock, @pDestAddr";
            let obj = yield te(query)
                .param('pTxHash', event.transactionHash, tedious.TYPES.VarChar)
                .param('pEvent', event.event, tedious.TYPES.VarChar)
                .param('pToken', token.symbol, tedious.TYPES.VarChar)
                .param('pFromChain', "GBA Hub", tedious.TYPES.VarChar)
                .param('pFromBlock', event.blockNumber, tedious.TYPES.Int)
                .param('pFromAddr', event.returnValues.from, tedious.TYPES.VarChar)
                .param('pToAddr', event.returnValues.to, tedious.TYPES.VarChar)
                .param('pValue', event.returnValues.value, tedious.TYPES.Decimal)
                .param('pClaimBy', '', tedious.TYPES.VarChar)
                .param('pClaimBlock', '', tedious.TYPES.VarChar)
                .param('pFee', 0, tedious.TYPES.Decimal)
                .param('pMemo', memo, tedious.TYPES.VarChar)
                .param('pDestChain', destChain, tedious.TYPES.VarChar)
                .param('pDestBlock', "", tedious.TYPES.VarChar)
                .param('pDestAddr', destAddr, tedious.TYPES.VarChar)
                .toObj((obj) => console.log("spTokenEvent " + JSON.stringify(obj)));
        }
        catch (e) {
            console.log("tokenEvent/processEvent ERROR: " + e);
        }
    });
}
function write2BChain(token, event) {
    return __awaiter(this, void 0, void 0, function* () {
        const retVals = event.returnValues;
        // console.log(retVals);
        console.log("GBA Hub/" + retVals.from.slice(-6) + " sent " + (retVals.value / (Math.pow(10, token.decimals))) + " " + token.symbol + " tokens to " +
            retVals.blockchain + "/" + retVals.destAddr + " - " + retVals.memo);
        if (retVals.destAddr == config.hsName) {
            let amount = (retVals.value / (Math.pow(10, token.decimals))).toString();
            var json = JSON.stringify({
                contractName: "tokens", contractAction: "transfer",
                contractPayload: { symbol: token.symbol, to: retVals.destAddr, quantity: amount, memo: retVals.memo }
            });
            if (retVals.blockchain == 'Hive') {
                console.log(retVals);
                //hive.broadcast.customJson(config.activeWif, [config.hsName], [], 'ssc-mainnet1', json, (err, result) => {
                //    console.log(err, result);
                //});
            }
            else {
                console.log(retVals);
                //steem.broadcast.customJson(config.activeWif, [config.hsName], [], 'ssc-mainnet1', json, (err, result) => {
                //    console.log(err, result);
                //});
            }
            ;
        }
    });
}
function processEvent(token, event) {
    return __awaiter(this, void 0, void 0, function* () {
        // if (!['CBTransfer'].includes(event.event)) return;           // necessary if using allEvents
        // console.log(event);
        // write2Db(token, event);
        write2BChain(token, event);
    });
}
function lastBlock() {
    return __awaiter(this, void 0, void 0, function* () {
        return 0;
        var count = yield app.get('te')("SELECT COUNT(1) from TokenEventsH").toPromise();
        if (count != 0)
            count = yield app.get('te')("SELECT MAX(Block) from TokenEventsH").toPromise();
        return (count);
    });
}
function pastEvents(token, startBlock) {
    return new Promise((resolve, reject) => {
        token.contract.getPastEvents('CBTransfer', { fromBlock: startBlock, toBlock: 'latest' }, (error, events) => {
            if (error)
                reject(error);
            else
                resolve(events);
        });
    });
}
;
// Due to the lack of Azure web sockets and therefore events, everything relies on a timer calling initToken events every minute
// ethWatcher and ethHandler are currently unused but will be used once web sockets are available and kludge timer call is removed
function initTokenEvents(token) {
    return __awaiter(this, void 0, void 0, function* () {
        token.contract = new web3.eth.Contract(gbaToken.abi, token.address, { data: gbaToken.bytecode });
        let startBlock = (yield lastBlock()) + 1;
        let events = yield pastEvents(token, startBlock);
        for (var i = 0; i < events.length; i++) {
            yield processEvent(token, events[i]);
        }
    });
}
exports.initTokenEvents = initTokenEvents;
function ethHandler(token, event) { processEvent(token, event); }
exports.ethHandler = ethHandler;
function ethWatcher(token) {
    return __awaiter(this, void 0, void 0, function* () {
        token.contract.getPastEvents('CBTransfer', { fromBlock: 0, toBlock: 'latest' }, (error, events) => {
            if (events == null)
                return;
            events.forEach((event) => { ethHandler(token, event); });
        });
    });
}
exports.ethWatcher = ethWatcher;
// ******************************************************************************************
// Watching Hive & Steem blockchains & taking actions on PoA Ethereum
function hsHandler(bChain, res, x) {
    if (config.tokens.includes(x.contractPayload.symbol)) {
        console.log("TOKEN = " + x.contractPayload.symbol);
        const vars = x.contractPayload;
        console.log(bChain.name + " - " + res.required_auths + " transferred " +
            vars.quantity + " " + vars.symbol +
            " tokens to " + vars.to + " - " + vars.memo);
        if (vars.to == config.hsName) {
            const amount = vars.quantity * config.token[x.contractPayload.symbol].decimals;
            config.token[x.contractPayload.symbol].contract.methods.approve(config.address, amount)
                .send({ from: config.address })
                .on('receipt', function (receipt) { console.log(receipt); })
                .on('error', console.error);
            config.token[x.contractPayload.symbol].contract.methods.ourTransferFrom(config.address, vars.memo, amount, "from Steem")
                .send({ from: config.address })
                .on('receipt', function (receipt) { console.log(receipt); })
                .on('error', console.error);
        }
    }
}
exports.hsHandler = hsHandler;
//# sourceMappingURL=hsGateway.js.map