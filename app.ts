declare global { namespace NodeJS { interface Global { app: any; } } }
const config = require('./config');
import express = require('express');
var app = express();
global.app = app;
const srvr = app.listen(process.env.PORT || 3001, function () { console.log('Hive Gateway listening'); });

class Article { constructor(public author: string, public identifier: string, public created: number, public vote: number) { } }
class Blockchain { constructor(public name: string, public bc, public articles: Article[], public flagSO: boolean) { } }

import { queueArticles, voteArticles } from './src/articles';
import { ethWatcher, ethHandler, hsHandler } from './src/hsGateway';
var hive: Blockchain = new Blockchain("hive", require("@hiveio/hive-js"), new Array<Article>(), false);
app.set('hive', hive);
hive.bc.api.setOptions({ url: config.hiveUrl });
hive.bc.config.set('alternative_api_endpoints', config.hiveAlts);
var steem: Blockchain = new Blockchain("steem", require("steem"), new Array<Article>(), false);
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
                    if (result[0] == "comment" && result[1].parent_author == "") { queueArticles(bchain, result); } }
                if (result[0] == "custom_json" && result[1].id == "ssc-mainnet1") {
                    var acts = JSON.parse(result[1].json);
                    if (acts.contractName == "tokens" && acts.contractAction == "transfer") {
                        if (Array.isArray(acts)) { acts.forEach(act => { hsHandler(result[1], act) });
                        } else hsHandler(result[1], acts);
                    }
                } else {
                    console.log(bchain.name + " - Caught Stream ERROR! " + JSON.stringify(err, replaceErrors));
                    // TODO: Go back and grab block ta errored out and process it
                    streamOps(bchain);
                }
            } catch (ex) { console.log(bchain.name + " - UNCAUGHT Stream ERROR! " + JSON.stringify(ex, replaceErrors)); }
        });
    } catch (ex) { console.log(bchain.name + " - Outer StreamOperations ERROR! " + JSON.stringify(ex, replaceErrors)); }
}

// add eth contract to config.tokens
ethWatcher(config.token['PLAY']);
streamOps(hive);
streamOps(steem);
setInterval(checkEvents, 60000);                                                // once a minute seems about right
async function checkEvents() {
    voteArticles(hive);
    if (hive.flagSO) hive.flagSO = false; else streamOps(hive);
    voteArticles(steem);
    if (steem.flagSO) steem.flagSO = false; else streamOps(steem);
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

