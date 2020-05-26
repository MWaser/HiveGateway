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
const express = require("express");
var app = express();
global.app = app;
const srvr = app.listen(process.env.PORT || 3001, function () { console.log('Hive/Steem Gateway watching'); });
const express4tediousX_1 = require("./express4tediousX");
app.set('te', express4tediousX_1.default(config.dbConn));
const utilities_1 = require("./src/utilities");
// The Hive/Steem gateway does more than just transferring tokens with hsHandler()
// It also votes for GBA members who blog on Hive or Steem with queueArticles()
class Article {
    constructor(author, identifier, created, vote) {
        this.author = author;
        this.identifier = identifier;
        this.created = created;
        this.vote = vote;
    }
}
class Blockchain {
    constructor(name, bc, articles, flagSO) {
        this.name = name;
        this.bc = bc;
        this.articles = articles;
        this.flagSO = flagSO;
    }
}
const articles_1 = require("./src/articles");
const hsGateway_1 = require("./src/hsGateway");
var hive = new Blockchain("hive", require("@hiveio/hive-js"), new Array(), false);
app.set('hive', hive);
hive.bc.api.setOptions({ url: config.hiveUrl });
hive.bc.config.set('alternative_api_endpoints', config.hiveAlts);
var steem = new Blockchain("steem", require("steem"), new Array(), false);
app.set('steem', steem);
steem.bc.api.setOptions({ url: config.steemUrl });
// import vote from './src/voting';                                                             // for testing purposes only
// vote(steem, 'digital-wisdom', 'reducing-timing-luck-and-the-future-of-splinterlands', 1);
// vote(hive, 'digital-wisdom', 'reducing-timing-luck-and-the-future-of-splinterlands', 1);
function streamOps(bChain) {
    try {
        bChain.bc.api.streamOperations(function (err, result) {
            try {
                bChain.flagSO = 1;
                if (err == null) {
                    if (result[0] == "comment" && result[1].parent_author == "") {
                        articles_1.queueArticles(bChain, result);
                    }
                    if (result[0] == "custom_json" && result[1].id == "ssc-mainnet1") {
                        var acts = JSON.parse(result[1].json);
                        if (acts.contractName == "tokens" && acts.contractAction == "transfer") {
                            if (Array.isArray(acts)) {
                                acts.forEach(act => { hsGateway_1.hsHandler(bChain, result[1], act); });
                            }
                            else
                                hsGateway_1.hsHandler(bChain, result[1], acts);
                        }
                    }
                }
                else {
                    utilities_1.logAdd("Hive Gateway", 4, bChain.name + " - Caught Stream ERROR! " + JSON.stringify(err, utilities_1.replaceErrors));
                    // TODO: Go back and grab block ta errored out and process it
                    streamOps(bChain);
                }
            }
            catch (ex) {
                utilities_1.logAdd("Hive Gateway", 4, bChain.name + " - UNCAUGHT Stream ERROR! " + JSON.stringify(ex, utilities_1.replaceErrors));
            }
        });
    }
    catch (ex) {
        utilities_1.logAdd("Hive Gateway", 4, bChain.name + " - Outer StreamOperations ERROR! " + JSON.stringify(ex, utilities_1.replaceErrors));
    }
}
// add eth contract to config.tokens
// config.tokens.forEach((token) => { initTokenEvents(config.token[token]); ethWatcher(config.token[token]) });
config.tokens.forEach((token) => hsGateway_1.initTokenEvents(config.token[token])); // ethWatcher temporarily removed for Kludge
streamOps(hive);
streamOps(steem);
setInterval(checkEvents, 60000); // once a minute seems about right
function checkEvents() {
    return __awaiter(this, void 0, void 0, function* () {
        utilities_1.logAdd('Hive Gateway', 5, "Checking events");
        config.tokens.forEach((token) => hsGateway_1.initTokenEvents(config.token[token])); // Kludge due to lack of Azure PoA web sockets
        articles_1.voteArticles(hive);
        if (hive.flagSO)
            hive.flagSO = false;
        else {
            utilities_1.logAdd("Hive Gateway", 3, "Hive Restart");
            streamOps(hive);
        }
        articles_1.voteArticles(steem);
        if (steem.flagSO)
            steem.flagSO = false;
        else {
            utilities_1.logAdd("Hive Gateway", 3, "Steem Restart");
            streamOps(steem);
        }
    });
}
//# sourceMappingURL=app.js.map