"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Article {
    constructor(author, identifier, created, vote) {
        this.author = author;
        this.identifier = identifier;
        this.created = created;
        this.vote = vote;
    }
}
class Blockchain {
    constructor(name, api, articles) {
        this.name = name;
        this.api = api;
        this.articles = articles;
    }
}
class Voter {
    constructor(name, wif) {
        this.name = name;
        this.wif = wif;
    }
}
var voters = [];
voters.push(new Voter("mark-waser", "5K3eJAoLGUDtX6JHF8bsvPq6kVwRoJUoBL5D5tKBmgZo6nCNWT9"));
voters.push(new Voter("digital-wisdom", "5JXhgFABaSqsasct3G555EHyRk717kbeEUn48TVkv1UU1Qpbu8K"));
voters.push(new Voter("ethical-ai", "5JEmVgmQMgBTLzdmxrQE3dgDgXByJ1fPYUM4JJvFjt8Ecdhwp3h"));
voters.push(new Voter("strong-ai", "5JeyKbCssr362dSZ734ph2k2JPssRCddR8tZYLokXwTTvgHv99u"));
voters.push(new Voter("technoprogressiv", "5KQggQu1UAhqdh5zeuoVeN6v4g5CJ8JKkBoZCjYYM7xZhEtt7tm"));
voters.push(new Voter("jwaser", "5Jc6zLd6eXDL1GY8RfFvhqsZjZGhn4ZoEhbXRxVFKEvgNYyByzi"));
voters.push(new Voter("herpetologyguy", "5Kk74oFssgQ6LSto6Dbwf1QFUfaKbd3a5m2t5Q9k7mJsGfHpJzN"));
voters.push(new Voter("morgan.waser", "5JqZit1ggjhdo3wp8hW2kDN7HWKVjxTfygSoqP1XKJdkuLT1bQX"));
voters.push(new Voter("bwaser", "5K4zwWNnyvUmD6RodY1UuSArwicVLnNxaTFmGpLQXX95xqDU3TG"));
voters.push(new Voter("handyman", "5KfMndwHZvAKFZT2AoWZs8bwY9VVKsaXSGFeAy8UagaXq7uSAEn"));
voters.push(new Voter("zero.state", "kpZEnqXt171oo5NSMhBbA9M9TRswaKHr"));
voters.push(new Voter("ellepdub", "5JuAvBsdDVBE4XwdmHXWkJnMBQvKxcSRnTZb1p65CKTuAUZiiLk"));
function vote(bchain, author, identifier, weight) {
    console.log("starting voting");
    for (let voter of voters) {
        console.log(voter.name + " voting");
        // steem.broadcast.vote(voter.wif, voter.name, author, identifier, weight, function (err, result) {
        bchain.bc.broadcast.vote(voter.wif, voter.name, author, identifier, 10000, function (err, result) {
            if (err == null)
                console.log(bchain.name + ' - ' + voter.name + " voted! ");
            else if (JSON.stringify(err).substr(0, 200).indexOf('already voted in a similar way') > -1) {
                console.log(bchain.name + ' - ' + voter.name + " already voted in a similar way!");
            }
            else if (JSON.stringify(err).substr(0, 200).indexOf('now < trx.expiration') > -1) {
                console.log(bchain.name + ' - ' + voter.name + " - EXPIRATION PROBLEM");
            }
            else {
                console.log(bchain.name + ' - ' + voter.name + " ERROR! " + JSON.stringify(err));
            }
        });
    }
}
exports.default = vote;
//# sourceMappingURL=voting.js.map