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
const srvr = app.listen(process.env.PORT || 3001, function () { console.log('Hive Gateway listening'); });
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
// import vote from './src/voting';
// vote(steem, 'digital-wisdom', 'reducing-timing-luck-and-the-future-of-splinterlands', 1);
// vote(hive, 'digital-wisdom', 'reducing-timing-luck-and-the-future-of-splinterlands', 1);
function streamOps(bchain) {
    try {
        bchain.bc.api.streamOperations(function (err, result) {
            try {
                bchain.flagSO = 1;
                if (err == null) {
                    if (result[0] == "comment" && result[1].parent_author == "") {
                        articles_1.queueArticles(bchain, result);
                    }
                }
                if (result[0] == "custom_json" && result[1].id == "ssc-mainnet1") {
                    var acts = JSON.parse(result[1].json);
                    if (acts.contractName == "tokens" && acts.contractAction == "transfer") {
                        if (Array.isArray(acts)) {
                            acts.forEach(act => { hsGateway_1.hsHandler(result[1], act); });
                        }
                        else
                            hsGateway_1.hsHandler(result[1], acts);
                    }
                }
                else {
                    console.log(bchain.name + " - Caught Stream ERROR! " + JSON.stringify(err, replaceErrors));
                    // TODO: Go back and grab block ta errored out and process it
                    streamOps(bchain);
                }
            }
            catch (ex) {
                console.log(bchain.name + " - UNCAUGHT Stream ERROR! " + JSON.stringify(ex, replaceErrors));
            }
        });
    }
    catch (ex) {
        console.log(bchain.name + " - Outer StreamOperations ERROR! " + JSON.stringify(ex, replaceErrors));
    }
}
// add eth contract to config.tokens
hsGateway_1.ethWatcher(config.token['PLAY']);
streamOps(hive);
streamOps(steem);
setInterval(checkEvents, 60000); // once a minute seems about right
function checkEvents() {
    return __awaiter(this, void 0, void 0, function* () {
        articles_1.voteArticles(hive);
        if (hive.flagSO)
            hive.flagSO = false;
        else
            streamOps(hive);
        articles_1.voteArticles(steem);
        if (steem.flagSO)
            steem.flagSO = false;
        else
            streamOps(steem);
    });
}
// debugging utility function; use for console.log(JSON.stringify(error, replaceErrors));
function replaceErrors(key, value) {
    if (value instanceof Error) {
        var error = {};
        Object.getOwnPropertyNames(value).forEach(function (key) { error[key] = value[key]; });
        return error;
    }
    return value;
}
//# sourceMappingURL=app.js.map