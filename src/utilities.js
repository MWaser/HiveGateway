"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tedious = require('tedious');
const app = global.app;
const te = app.get('te');
function logAdd(app, severity, message) {
    var now = new Date();
    console.log(message + now.toDateString() + " " + now.toTimeString());
    try {
        te("exec spLogAdd @pApp, @pSeverity, @pMessage")
            .param('pApp', app, tedious.TYPES.VarChar)
            .param('pSeverity', severity, tedious.TYPES.Int)
            .param('pMessage', message, tedious.TYPES.VarChar).exec();
    }
    catch (e) {
        console.log("logAdd ERROR: " + e);
    }
}
exports.logAdd = logAdd;
;
// debugging utility function; use for alert(JSON.stringify(error, replaceErrors));
function replaceErrors(key, value) {
    if (value instanceof Error) {
        var error = {};
        Object.getOwnPropertyNames(value).forEach(function (key) { error[key] = value[key]; });
        return error;
    }
    return value;
}
exports.replaceErrors = replaceErrors;
//# sourceMappingURL=utilities.js.map