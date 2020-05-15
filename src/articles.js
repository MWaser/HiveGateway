"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voting_1 = require("./voting");
class Article {
    constructor(author, identifier, created, vote) {
        this.author = author;
        this.identifier = identifier;
        this.created = created;
        this.vote = vote;
    }
}
class Author {
    constructor(name, score) {
        this.name = name;
        this.score = score;
    }
}
var authors = [];
class Blockchain {
    constructor(name, bc, articles) {
        this.name = name;
        this.bc = bc;
        this.articles = articles;
    }
}
authors.push(new Author("mark-waser", 1));
authors.push(new Author("digital-wisdom", 1));
authors.push(new Author("jwaser", 1));
authors.push(new Author("herpetologyguy", 1));
authors.push(new Author("morgan.waser", 1));
authors.push(new Author("davidjkelley", 1));
authors.push(new Author("technoprogressiv", 1));
authors.push(new Author("handyman", 1));
authors.push(new Author("howo", 1)); // ** 173-238; 2/week                  
authors.push(new Author("netuoso", 1)); // hive; new; 154/0/28/151
authors.push(new Author("theycallmedan", 1)); // hive; 74/134/53/29
authors.push(new Author("three", 0.5)); // hive; huge
authors.push(new Author("anomadsoul", 0.5)); // 5-105; 5/week
authors.push(new Author("anyx", 1)); // ** rare, high
authors.push(new Author("brittuf", 1)); // ** 72-100; 3/week  
authors.push(new Author("buggedout", 1)); // ** rare, high
authors.push(new Author("buildteam", 0.5)); // ** 50-60; 2/week
authors.push(new Author("busy.org", 1)); // ** rare, high
authors.push(new Author("buzzi", 1)); // ** new, huge
authors.push(new Author("chainwise", 1)); // ** 0-359; 1/week
authors.push(new Author("chbartist", 1)); // recently 92-196, 1-2/day
authors.push(new Author("conformity", 1)); // ** 100; maybe gone
authors.push(new Author("crypt0lizard", 0.5)); // ** 200; maybe gone   
authors.push(new Author("crypto.piotr", 1)); // ** 35-188; 2-3/month
authors.push(new Author("dahaz159", 1)); // ** rare; huge
authors.push(new Author("deathcross", 0.5)); // 17-80; 2/day
authors.push(new Author("dtube", 1)); // ** 133-300; 1/week
authors.push(new Author("edgarare1", 0.5)); // 35-98; 2/week
authors.push(new Author("epicdice", 1)); // 74-167; 1/week
authors.push(new Author("etcmike", 1)); // ** 38-103; 4/week
authors.push(new Author("fatkat", 1)); // 56-122; vacation?
authors.push(new Author("finprep", 0.5)); // 7-147; 3-4/week
authors.push(new Author("firepower", 0.5)); // 15-97; 2/day
authors.push(new Author("fyrstikken", 0.5)); // new; 39-169; 3/week
authors.push(new Author("ghi", 1)); // new; 47-66; 2-3/week
authors.push(new Author("good-karma", 1)); // ** rare; high
authors.push(new Author("hatu", 1)); // ** 173-238; 2/week                  
authors.push(new Author("heimindanger", 1)); // ** rare, high
authors.push(new Author("intrepidphotos", 0.5)); // 36-86; 1/week
authors.push(new Author("jackmiller2", 0.5)); // 22-95; 3/week; new
authors.push(new Author("jamesgoddard", 0.5)); // 17-60; 1-2/week
authors.push(new Author("jellenmark", 1)); // ** rare, high
authors.push(new Author("jrcornel", 0.75)); // ** 47-74; 1/day
authors.push(new Author("kevinwong", 0.5)); // 29-223; maybe gone
authors.push(new Author("majes.tytyty", 1)); // ** 29-100; 2/day
authors.push(new Author("mehta", 1)); // ** 50-106; 1/day
authors.push(new Author("minnowbooster", 0.5)); // rare; 50-100
authors.push(new Author("muratkbesiroglu", 0.5)); // ** 68-81; 4/week
authors.push(new Author("ncquote", 0.5)); // new; 10-117; 2/week
authors.push(new Author("nicholasmerten", 0.5)); // 12-68; 4/week
authors.push(new Author("null.promoted", 1)); // ** new, 3-4/week; 1-185
authors.push(new Author("oendertuerk", 1)); // ** 40-70; 1/day
authors.push(new Author("oracle-d", 0.5)); // 32-189; 1/week
authors.push(new Author("privex", 1)); // ** rare; high
authors.push(new Author("probit", 1)); // ** rare; high
authors.push(new Author("roadofrich", 0.5)); // 10-169; 1/day
authors.push(new Author("rest100", 1)); // ** 168-200; 1/week
authors.push(new Author("roger.remix", 0.5)); // 31-119; 2/week
authors.push(new Author("smartsteem", 1)); // ** rare; high
authors.push(new Author("smilika", 1.0)); // ** new, high
authors.push(new Author("steem-bounty", 1)); // ** 101-157; 1/week
authors.push(new Author("steeminfobot", 1)); // ** 55-190; 1/week
authors.push(new Author("steem.marketing", 1)); // ** new; huge
authors.push(new Author("steem.organic", 0.5)); // 1-188; 1/day
authors.push(new Author("steempress", 1)); // ** rare, high
authors.push(new Author("steemvoter", 1)); // rare; high
authors.push(new Author("sweetsssj", 1)); // ** rare; high
authors.push(new Author("tahirozgen", 1)); // ** 78-121; 2/month
authors.push(new Author("the4thmusketeer", 1)); // ** 52-162; 1/week
authors.push(new Author("threespeakshorts", 0.5)); // 19-65; 1/week
authors.push(new Author("trafalgar", 1)); // ** rare; high
authors.push(new Author("transisto", 1)); // ** 127-152; 1/week
authors.push(new Author("volentix", 1)); // ** 92-340; vacation?
authors.push(new Author("zaku", 0.5)); // 13-205; 2/day
authors.push(new Author("zer0hedge", 1)); // 2-171; 1/day
function articleIsNew(articles, author, identifier) {
    for (var i = 0, len = articles.length; i < len; i++) {
        if (articles[i].author === author && articles[i].identifier === identifier)
            return false;
    }
    return true;
}
function authorExists(name) {
    for (var i = 0, len = authors.length; i < len; i++) {
        if (authors[i].name === name)
            return authors[i].score;
    }
    return 0;
}
function currTime() {
    var nowLocal = new Date();
    var nowUtc = new Date(nowLocal.getTime() + (nowLocal.getTimezoneOffset() * 60000));
    return nowUtc.valueOf() / 1000;
}
function queueArticles(bchain, tx) {
    var authorScore = authorExists(tx[1].author);
    console.log(bchain.name + " - " + tx[1].author + "/" + tx[1].permlink + " = " + authorScore.toString());
    if (authorScore > 0) {
        bchain.bc.api.getContent(tx[1].author, tx[1].permlink, function (err, tx) {
            var created = (new Date(Date.parse(tx.created))).valueOf() / 1000;
            if ((currTime() - created) < 880) {
                if (articleIsNew(bchain.articles, tx.author, tx.permlink)) {
                    bchain.articles.push(new Article(tx.author, tx.permlink, created, authorScore));
                    console.log(bchain.name + " - NEW GOOD ARTICLE! ");
                }
                else {
                    console.log(bchain.name + " - OLD GOOD ARTICLE! ");
                }
            }
            else {
                console.log(bchain.name + " - MISSED " + tx.author + "/" + tx.permlink + "-" + tx.created);
            }
        });
    }
}
exports.queueArticles = queueArticles;
function voteArticles(bchain) {
    var now = currTime();
    if (bchain.articles.length > 0) {
        for (let art of bchain.articles) {
            console.log(bchain.name + " - WAITING! " + (now - art.created).toString() + " // " + art.author + " - " + art.identifier);
        }
        if ((now - bchain.articles[0].created) >= 885) {
            voting_1.default(bchain, bchain.articles[0].author, bchain.articles[0].identifier, bchain.articles[0].vote);
            bchain.articles.shift();
        }
    }
    else {
        console.log(bchain.name + " - Empty queue");
    }
}
exports.voteArticles = voteArticles;
//# sourceMappingURL=articles.js.map