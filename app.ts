import axios from 'axios';
declare global { namespace NodeJS { interface Global { app: any; } } }
const config = require('./config');
import express = require('express');
var app = express();
global.app = app;
const srvr = app.listen(process.env.PORT || 3001, function () { console.log('Hive/Steem Gateway watching'); });
import te from './express4tediousX';
app.set('te', te(config.dbConn));
import { logAdd, replaceErrors } from './src/utilities'

// The Hive/Steem gateway does more than just transferring tokens with hsHandler()
// It also votes for GBA members who blog on Hive or Steem with queueArticles()

class Article { constructor(public author: string, public identifier: string, public created: number, public vote: number) { } }
class Blockchain { constructor(public name: string, public bc, public articles: Article[], public flagSO: boolean) { } }

import { queueArticles, voteArticles } from './src/articles';
import { initTokenEvents, ethWatcher, hsHandler } from './src/hsGateway';
var hive: Blockchain = new Blockchain("hive", require("@hiveio/hive-js"), new Array<Article>(), false);
app.set('hive', hive);
hive.bc.api.setOptions({ url: config.hiveUrl });
hive.bc.config.set('alternative_api_endpoints', config.hiveAlts);
//var steem: Blockchain = new Blockchain("steem", require("steem"), new Array<Article>(), false);
//app.set('steem', steem);
//steem.bc.api.setOptions({ url: config.steemUrl });

import vote from './src/voting';                                                             // for testing purposes only
vote(hive, 'digital-wisdom', 'exode-colonization-exploration-discovery-collecting-and-crafting', 1);

function streamOps(bChain) {
    try {
        bChain.bc.api.streamOperations(function (err, result) {
            try {
                bChain.flagSO = 1;
                if (err == null) {
                    if (result[0] == "comment" && result[1].parent_author == "") { queueArticles(bChain, result); }
                    if (result[0] == "custom_json" && result[1].id == "ssc-mainnet1") {
                        var acts = JSON.parse(result[1].json);
                        if (acts.contractName == "tokens" && acts.contractAction == "transfer") {
                            if (Array.isArray(acts)) {
                                acts.forEach(act => { hsHandler(bChain, result[1], act) });
                            } else hsHandler(bChain, result[1], acts);
                        }
                    }
                } else {
                    logAdd("Hive Gateway", 4, bChain.name + " - Caught Stream ERROR! " + JSON.stringify(err, replaceErrors));
                    // TODO: Go back and grab block ta errored out and process it
                    streamOps(bChain);
                }
            } catch (ex) { logAdd("Hive Gateway", 4, bChain.name + " - UNCAUGHT Stream ERROR! " + JSON.stringify(ex, replaceErrors)); }
        });
    } catch (ex) { logAdd("Hive Gateway", 4, bChain.name + " - Outer StreamOperations ERROR! " + JSON.stringify(ex, replaceErrors)); }
}

// add eth contract to config.tokens
// config.tokens.forEach((token) => { initTokenEvents(config.token[token]); ethWatcher(config.token[token]) });
config.tokens.forEach((token) => initTokenEvents(config.token[token]));         // ethWatcher temporarily removed for Kludge
streamOps(hive);
// streamOps(steem);
setInterval(checkEvents, 60000);                                                // once a minute seems about right
async function checkEvents() {
    logAdd('Hive Gateway', 5, "Checking events");
    config.tokens.forEach((token) => initTokenEvents(config.token[token]));     // Kludge due to lack of Azure PoA web sockets
    voteArticles(hive);
    if (hive.flagSO) hive.flagSO = false; else { logAdd("Hive Gateway", 3, "Hive Restart"); streamOps(hive); }
    //voteArticles(steem);
    //if (steem.flagSO) steem.flagSO = false; else { logAdd("Hive Gateway", 3, "Steem Restart"); streamOps(steem); }
}

setInterval(keepAlive, 900000);                                                // every 15 minutes seems about right
async function keepAlive() {
    axios.get('https://gbbp-api.azurewebsites.net/');
}

