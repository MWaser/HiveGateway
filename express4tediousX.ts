﻿var TYPES = require('tedious').TYPES;

export default function tediousExpressX(config) {
    return function (sqlQueryText) {
        var Connection = require('tedious').Connection;

        return {
            connection: new Connection(config),
            sql: sqlQueryText,
            parameters: [],
            isEmptyResponse: true,
            defaultOutput: "",
            param: function (param, value, type) {
                this.parameters.push({ name: param, type: type, value: value });
                return this;
            },
            exec: function (ostream, successResponse) {
                var request = this.__createRequest(ostream);
                this.__ExecuteRequest(request, ostream);
            },
            into: function (ostream, defaultOutput = "[]") {
                var request = this.__createRequest(ostream);
                var self = this;
                self.defaultOutput = defaultOutput;

                request.on('row', function (columns) {
                    if (self.isEmptyResponse) {
                        self.isEmptyResponse = false;
                    }
                    ostream.write(columns[0].value);
                });
                this.__ExecuteRequest(request, ostream);
            },
            toStr: function (cb) {
                var myStr = '';
                var Stream = require('stream');
                var ws = new Stream;
                ws.writable = true;
                ws.bytes = 0;
                ws.write = function (buf) {
                    ws.bytes += buf.length;
                    myStr += buf;
                };
                ws.end = function (buf) {
                    if (arguments.length) ws.write(buf);
                    ws.writable = false;
                    cb(myStr);
                };
                this.into(ws);
            },
            toObj: function (cb) {
                this.toStr(function (str) { cb(JSON.parse(str)); });
            },
            toPromise: function () {
                return new Promise((resolve, reject) => {
                    this.fail(reject);
                    this.toObj((obj) => resolve(obj));
                });
            },
            __ExecuteRequest: function (request, ostream) {
                var self = this;
                this.connection.connect();
                this.connection.on('connect', function (err) {
                    if (err) {
                        console.trace(err);
                        self.fnOnError && self.fnOnError(err, ostream);

                    } else {
                        self.connection.execSql(request);
                    }
                });
            },
            __createRequest: function (ostream) {
                var Request = require('tedious').Request;
                var self = this;
                var request =
                    new Request(this.sql,
                        function (err, rowCount) {
                            try {
                                if (err) {
                                    self.fnOnError && self.fnOnError(err, ostream);
                                }
                                if (self.isEmptyResponse && self.defaultOutput != "") {
                                    ostream.write(self.defaultOutput);
                                }
                            } catch (ex) {
                                console.log(ex);
                            }
                            finally {
                                self.connection && self.connection.close();
                                self.fnOnDone && self.fnOnDone('Connection closed', ostream);
                            }
                        });

                for (var index in this.parameters) {
                    request.addParameter(
                        this.parameters[index].name,
                        this.parameters[index].type || TYPES.NVarChar,
                        this.parameters[index].value);
                }
                return request;
            },
            done: function (fnDone) {
                this.fnOnDone = fnDone;
                return this;
            },
            fail: function (fnFail) {
                this.fnOnError = fnFail;
                return this;
            },
            fnOnDone: function (message, ostream) {
                try {
                    ostream && ostream.end();
                } catch (ex) {
                    console.trace(ex);
                }
            },
            fnOnError: function (error, ostream) {
                try {
                    ostream && ostream.status(500);
                    ostream && ostream.write(error.message);
                    ostream && ostream.end();
                } catch (ex) {
                    console.warn("Cannot close response after error: " + ex + "\nOriginal error:" + error);
                }
                console.trace(error);
            }
        }
    }
}
