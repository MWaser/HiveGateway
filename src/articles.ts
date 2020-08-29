import vote from './voting';

class Article { constructor(public author: string, public identifier: string, public created: number, public vote: number) { } }
class Author { constructor(public name: string, public score: number) { } }
var authors: Author[] = [];
class Blockchain { constructor(public name: string, public bc, public articles: Article[]) { } }

authors.push(new Author("mark-waser", 1));
authors.push(new Author("digital-wisdom", 1));
authors.push(new Author("jwaser", 1));
authors.push(new Author("herpetologyguy", 1));
authors.push(new Author("morgan.waser", 1));
authors.push(new Author("davidjkelley", 1));
authors.push(new Author("technoprogressiv", 1));
authors.push(new Author("handyman", 1));

authors.push(new Author("abh12345", 0.5));                // 
authors.push(new Author("acidyo", 0.5));                  // 
authors.push(new Author("activistpost", 0.5));            // 
authors.push(new Author("aggroed", 0.5));                 // 
authors.push(new Author("andrarchy", 0.5));               // 
authors.push(new Author("anyx", 0.5));                    //
authors.push(new Author("apshamilton", 0.5));             // 
authors.push(new Author("arcange", 0.5));                 // 
authors.push(new Author("ausbitbank", 0.5));              // 
authors.push(new Author("blocktrades", 0.5));             // 
authors.push(new Author("dalz", 0.5));                    // 
authors.push(new Author("dbroze", 0.5));                  // 
authors.push(new Author("deanliu", 0.5));                 // 
authors.push(new Author("ecency", 0.5));                  // 
authors.push(new Author("eco-alex", 0.5));                // 
authors.push(new Author("ecotrain", 0.5));                // 
authors.push(new Author("elindos", 0.5));                 // 
authors.push(new Author("elsan.artes", 0.5));             // 
authors.push(new Author("emrebeyler", 0.5));              // 
authors.push(new Author("erangvee", 0.5));                // 
authors.push(new Author("exodenews", 0.5));               // 
authors.push(new Author("fredrikaa", 0.5));               // 
authors.push(new Author("good-karma", 0.5));              //
authors.push(new Author("gtg", 0.5));                     //                 
authors.push(new Author("hiddenblade", 0.5));             // 
authors.push(new Author("hivegc", 0.5));                  // 
authors.push(new Author("hiveonboard", 0.5));             // 
authors.push(new Author("hivewatchers", 0.5));            // 
authors.push(new Author("holger80", 0.5));                // 
authors.push(new Author("howo", 0.5));                    //                 
authors.push(new Author("idoctor", 0.5));                 //                 
authors.push(new Author("jrcornel", 0.5));                //
authors.push(new Author("krnel", 0.5));                   // 
authors.push(new Author("lizanomadsoul", 0.5));           // 
authors.push(new Author("maxigan", 0.5));                 // 
authors.push(new Author("majes.tytyty", 0.5));            //
authors.push(new Author("meesterboom", 0.5));             // 
authors.push(new Author("netuoso", 0.5));                 // 
authors.push(new Author("oflyhigh", 0.5));                // 
authors.push(new Author("peakd", 0.5));                   // 
authors.push(new Author("probit", 0.5));                  //
authors.push(new Author("quochuy", 0.5));                 // 
authors.push(new Author("rolandp", 0.5));                 // 
authors.push(new Author("rowye", 0.5));                   // 
authors.push(new Author("splinterlands", 0.5));           // 
authors.push(new Author("slobberchops", 0.5));            // 
authors.push(new Author("steempeak", 0.5));               // 
authors.push(new Author("sweetsssj", 0.5));               // 
authors.push(new Author("tarazkp", 0.5));                 // 
authors.push(new Author("taskmaster4450", 0.5));          // 
authors.push(new Author("themarkymark", 0.5));            // 
authors.push(new Author("theouterlight", 0.5));           // 
authors.push(new Author("theycallmedan", 0.5));           //
authors.push(new Author("tlavagabond", 0.5));             //
authors.push(new Author("three", 0.5));                   // 
authors.push(new Author("threespeak", 0.5));              //
authors.push(new Author("v4vapid", 0.5));                 //

function articleIsNew(articles: Article[], author: string, identifier: string) {
    for (var i = 0, len = articles.length; i < len; i++) {
        if (articles[i].author === author && articles[i].identifier === identifier) return false;
    }
    return true;
}

function authorExists(name: string) {
    for (var i = 0, len = authors.length; i < len; i++) { if (authors[i].name === name) return authors[i].score; }
    return 0;
}

function currTime() {
    var nowLocal = new Date();
    var nowUtc = new Date(nowLocal.getTime() + (nowLocal.getTimezoneOffset() * 60000));
    return nowUtc.valueOf() / 1000;
}

function queueArticles(bchain: Blockchain, tx) {
    var authorScore = authorExists(tx[1].author);
    console.log(bchain.name + " - " + tx[1].author + "/" + tx[1].permlink + " = " + authorScore.toString());
    if (authorScore > 0) {
        bchain.bc.api.getContent(tx[1].author, tx[1].permlink, function (err, tx) {
            var created: number = (new Date(Date.parse(tx.created))).valueOf() / 1000;
            if ((currTime() - created) < 280) {
                if (articleIsNew(bchain.articles, tx.author, tx.permlink)) {
                    bchain.articles.push(new Article(tx.author, tx.permlink, created, authorScore));
                    console.log(bchain.name + " - NEW GOOD ARTICLE! ");
                } else { console.log(bchain.name + " - OLD GOOD ARTICLE! "); }
            } else { console.log(bchain.name + " - MISSED " + tx.author + "/" + tx.permlink + "-" + tx.created); }
        });
    }
}

function voteArticles(bchain: Blockchain) {
    var now = currTime();
    if (bchain.articles.length > 0) {
        for (let art of bchain.articles) { console.log(bchain.name + " - WAITING! " + (now - art.created).toString() + " // " + art.author + " - " + art.identifier); }
        if ((now - bchain.articles[0].created) >= 285) {
            vote(bchain, bchain.articles[0].author, bchain.articles[0].identifier, bchain.articles[0].vote);
            bchain.articles.shift();
        }
    } else { console.log(bchain.name + " - Empty queue"); }
}

export { queueArticles, voteArticles };
