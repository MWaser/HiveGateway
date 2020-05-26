const tedious = require('tedious');
const config = require('../config');
const app = global.app;
var hive = app.get('hive');
var steem = app.get('steem');
const te = app.get('te');
const taskQ = app.get('taskQ');
import * as  gbaToken from '../build/contracts/GBAToken.json';

const Web3 = require('web3');
var web3 = new Web3(config.addrCurr);
const account = web3.eth.accounts.privateKeyToAccount('0x' + config.privateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;
config.tokens.forEach((token) => config.token[token].contract = new web3.eth.Contract(gbaToken.abi, config.token[token].address, { data: gbaToken.bytecode }));

// ******************************************************************************************
// Watching PoA Ethereum blockchain & taking actions on Hive or Steem

async function write2Db(token, event) {
    let memo = event.returnValues.memo ? event.returnValues.memo : '';
    let destChain = event.returnValues.blockchain ? event.returnValues.blockchain : '';
    let destAddr = event.returnValues.destAddr ? event.returnValues.destAddr : '';
    try {
        let query = "exec spTokenEventH @pTxHash, @pEvent, @pToken, @pFromChain, @pFromBlock, @pFromAddr, ";
        query += "@pToAddr, @pValue, @pMemo, @pClaimBy, @pClaimBlock, @pFee, @pDestChain, @pDestBlock, @pDestAddr";
        let obj = await te(query)
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
    } catch (e) { console.log("tokenEvent/processEvent ERROR: " + e); }
}

async function write2BChain(token, event) {
    const retVals = event.returnValues;
    // console.log(retVals);
    console.log("GBA Hub/" + retVals.from.slice(-6) + " sent " + (retVals.value / (10 ** token.decimals)) + " " + token.symbol + " tokens to " +
        retVals.blockchain + "/" + retVals.destAddr + " - " + retVals.memo);

    if (retVals.destAddr == config.hsName) {
        let amount: string = (retVals.value / (10 ** token.decimals)).toString();
        var json = JSON.stringify({
            contractName: "tokens", contractAction: "transfer",
            contractPayload: { symbol: token.symbol, to: retVals.destAddr, quantity: amount, memo: retVals.memo }
        });
        if (retVals.blockchain == 'Hive') {
            console.log(retVals);
            //hive.broadcast.customJson(config.activeWif, [config.hsName], [], 'ssc-mainnet1', json, (err, result) => {
            //    console.log(err, result);
            //});
        } else {
            console.log(retVals);
            //steem.broadcast.customJson(config.activeWif, [config.hsName], [], 'ssc-mainnet1', json, (err, result) => {
            //    console.log(err, result);
            //});
        };
    }
}

async function processEvent(token, event) {
    // if (!['CBTransfer'].includes(event.event)) return;           // necessary if using allEvents
    // console.log(event);

    // write2Db(token, event);
    write2BChain(token, event);
}

async function lastBlock() {
    return 0;
    var count = await app.get('te')("SELECT COUNT(1) from TokenEventsH").toPromise();
    if (count != 0) count = await app.get('te')("SELECT MAX(Block) from TokenEventsH").toPromise();
    return (count);
}

function pastEvents(token, startBlock): Promise<[]> {
    return new Promise((resolve, reject) => {
        token.contract.getPastEvents('CBTransfer', { fromBlock: startBlock, toBlock: 'latest' }, (error, events) => {
            if (error) reject(error); else resolve(events);
        });
    })
};


// Due to the lack of Azure web sockets and therefore events, everything relies on a timer calling initToken events every minute
// ethWatcher and ethHandler are currently unused but will be used once web sockets are available and kludge timer call is removed

export async function initTokenEvents(token) {  
    token.contract = new web3.eth.Contract(gbaToken.abi, token.address, { data: gbaToken.bytecode })
    let startBlock = await lastBlock() + 1;
    let events = await pastEvents(token, startBlock);
    for (var i = 0; i < events.length; i++) { await processEvent(token, events[i]); }
}

function ethHandler(token, event) { processEvent(token, event); }

async function ethWatcher(token) {
    token.contract.getPastEvents('CBTransfer', { fromBlock: 0, toBlock: 'latest' },
        (error, events) => {
            if (events == null) return;
            events.forEach((event) => { ethHandler(token, event) });
        });
}

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

export { ethWatcher, ethHandler, hsHandler };

