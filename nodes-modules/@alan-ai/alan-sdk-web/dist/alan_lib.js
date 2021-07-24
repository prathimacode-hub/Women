;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.alanBtn = factory();
  }
}(this, function() {
(function (ns) {
    "use strict";

    function testSocket() {
        return new Promise(function (resolve, reject) {
            var socketUrl = 'wss://javascript.info/article/websocket/chat/ws';
            console.log('[WS]: Start testing');
            console.log('[WS]: Connecting to ' + socketUrl);

            try {
                var socket = new WebSocket(socketUrl);
                socket.onopen = function (e) {
                    var testMsg = 'test-msg';
                    console.log('[WS]: Connection established');
                    console.log('[WS]: Sending data to socket, msg: ' + testMsg);
                    socket.send(testMsg);
                };

                socket.onmessage = function (event) {
                    console.log('[WS]: Data received from server: ' + event.data);
                    console.log('[WS]: Finish testing - OK');
                    resolve();
                };

                socket.onerror = function (error) {
                    console.log('[WS]: ', error.message);
                    console.log('[WS]: Finish testing - ERROR');
                    reject();
                };
            }
            catch (err) {
                console.log('[WS]: ', err);
                reject();
            }
        });
    }
    function testWorker() {
        return new Promise(function (resolve, reject) {
            console.log("[WebWorker]: Start testing");
            if (typeof (Worker) !== "undefined") {
                console.log('[WebWorker]: Has Web Worker support');

                try {
                    var myWorker = new Worker(window.URL.createObjectURL(new Blob(["onmessage = function(e) {console.log('[WebWorker]: Message received from main script');var workerResult = e.data[0];console.log('[WebWorker]: Posting message back to main script');postMessage(workerResult);}"])));
                    myWorker.onmessage = function (e) {
                        console.log('[WebWorker]: Message received from worker: ', e.data);
                        console.log('[WebWorker]: Finish testing - OK');
                        resolve();
                    }

                    myWorker.onerror = function (err) {
                        console.error('[WebWorker]: Finish testing - ERROR');
                        reject();
                    }
                    myWorker.postMessage(['test-msg']);
                } catch (err) {
                    console.error('[WebWorker]: Finish testing - ERROR');
                    reject();
                }
            } else {
                console.log('[WebWorker]: No Web Worker support');
                reject();
            }
        });
    }

    function testOrignSecure() {
        return new Promise(function (resolve, reject) {
            console.log("[ORIGN]: Start testing");
            var protocol = window.location.protocol;
            var hostname = window.location.hostname;

            if (protocol === 'https:' || protocol === 'file:' || (protocol === 'http:' && (hostname.indexOf('localhost') > -1 || hostname.indexOf('127.0.0.1') > -1))) {
                console.log('[ORIGN]: Secure');
                console.log('[ORIGN]: Finish testing - OK');
                resolve();
            } else {
                console.log('[ORIGN]: Not secure');
                console.log('[ORIGN]: Finish testing - ERROR');
                reject();
            }
        });
    }

    function testAudioContext() {
        return new Promise(function (resolve, reject) {
            console.log("[AUDIO CONTEXT]: Start testing");
            var fakeGetUserMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia ||
                (navigator.mediaDevices && navigator.mediaDevices.getUserMedia));

            var fakeContext = window.AudioContext ||
                window.webkitAudioContext ||
                window.mozAudioContext;

            if (fakeGetUserMedia && fakeContext) {
                console.log('[AUDIO CONTEXT]: Audio supported');
                console.log('[AUDIO CONTEXT]: Finish testing - OK');
                resolve();
            } else {
                console.log('[AUDIO CONTEXT]: Audio NOT supported');
                console.log('[AUDIO CONTEXT DETAILS]:', getAudioDebugInfo());
                console.log('[AUDIO CONTEXT]: Finish testing - ERROR');
                reject();
            }
        });
    }

    function getAudioDebugInfo() {
        var info = '';

        info += 'getUserMedia: ';
        info += navigator.getUserMedia ? '1' : '0';
        info += ', ';

        info += 'mediaDevices: ';
        info += (navigator.mediaDevices) ? '1' : '0';
        info += ', ';

        info += 'mediaDevices.getUserMedia: ';
        info += (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? '1' : '0';
        info += ', ';

        info += 'webkitGUM: ';
        info += navigator.webkitGetUserMedia ? '1' : '0';
        info += ', ';

        info += 'mozGUM: ';
        info += navigator.mozGetUserMedia ? '1' : '0';
        info += ', ';

        info += 'msGUM: ';
        info += navigator.msGetUserMedia ? '1' : '0';
        info += '\n';

        info += 'window: \n';

        info += 'AudioContext: ';
        info += window.AudioContext ? '1' : '0';
        info += ', ';

        info += 'webkitAC: ';
        info += window.webkitAudioContext ? '1' : '0';
        info += ', ';

        info += 'mozAC: ';
        info += window.mozAudioContext ? '1' : '0';
        info += '\n';

        info += 'userAgent: ';
        info += navigator.userAgent;

        return info;
    }

    function testAll() {
        var that = this;
        var allTests = Object.keys(this);

        function getNextTest(nextTestName) {
            return that[nextTestName]();
        }

        allTests = allTests.filter(name => name !== 'run' && name !== 'getAudioDebugInfo')

        return allTests.reduce((prevPromise, nextTestName) => {
            return prevPromise.then(() => {
                return getNextTest(nextTestName);
            });
        }, Promise.resolve());
    }

    ns.alanDiagnostic = {
        testSocket: testSocket,
        testWorker: testWorker,
        testOrignSecure: testOrignSecure,
        testAudioContext: testAudioContext,
        getAudioDebugInfo: getAudioDebugInfo,
        run: testAll
    };

})(window);

(function(ns) {
    "use strict";

    var host = 'studio.alan.app';

    var config = {
        // baseURL: (window.location.protocol === "https:" ? "wss://" : "ws://") +
        baseURL: "wss://" +
            ((host.indexOf('$') === 0 || host === '') ? window.location.hostname : host ),
        codec: 'opus',
        version: '2.0.45',
        platform: 'web',
    };

    function ConnectionWrapper() {
        var _this = this;
        this._worker = new Worker(window.URL.createObjectURL(new Blob(["(function(ns) {\n    'use strict';\n\n    var SENT_TS    = 1;\n    var REMOTE_TS  = 2;\n    var TIMESTAMP  = 3;\n    var AUDIO_DATA = 4;\n    var JSON_DATA  = 5;\n\n    AlanFrame.fields = [\n        propUint64(SENT_TS,   'sentTs'),\n        propUint64(REMOTE_TS, 'remoteTs'),\n        propUint64(TIMESTAMP, 'timestamp'),\n        propBytes(AUDIO_DATA, 'audioData'),\n        propJson(JSON_DATA,   'jsonData'),\n    ];\n\n    function AlanFrameProp(type, name, sizeF, readF, writeF) {\n        this.type   = type;\n        this.name   = name;\n        this.sizeF  = sizeF;\n        this.writeF = writeF;\n        this.readF  = readF;\n    }\n\n    function fixedSize(size) {\n        return function() {\n            return size;\n        }\n    }\n\n    function bufferSize(buffer) {\n        return 4 + byteLength(buffer);\n    }\n\n    function writeUIntN(uint8array, value, nBytes, offset) {\n        for (var i = 0; i < nBytes; i++ ) {\n            uint8array[offset + i] = 0xFF & value;\n            value /= 256;\n        }\n    }\n\n    function readUIntN(uint8array, nBytes, offset) {\n        var r = 0;\n        for (var i = nBytes - 1; i >= 0; i-- ) {\n            r *= 256;\n            r += 0xFF & uint8array[offset + i];\n        }\n        return r;\n    }\n\n    function writeUInt64(uint8array, value, offset) {\n        writeUIntN(uint8array, value, 8, offset);\n    }\n\n    function readUInt64(uint8array, offset) {\n        return readUIntN(uint8array, 8, offset);\n    }\n\n    function writeUInt32(uint8array, value, offset) {\n        writeUIntN(uint8array, value, 4, offset);\n    }\n\n    function readUInt32(uint8array, offset) {\n        return readUIntN(uint8array, 4, offset);\n    }\n\n    function writeBuffer(uint8array, buffer, offset) {\n        buffer = toUint8(buffer);\n        writeUInt32(uint8array, buffer.length, offset);\n        for (var i = 0; i < buffer.length; i++ ) {\n            uint8array[offset + 4 + i] = buffer[i];\n        }\n    }\n\n    function readBuffer(uint8array, offset) {\n        var size = readUInt32(uint8array, offset);\n        if (size > 1024 * 1024) {\n            throw new Error('buffer too big');\n        }\n        return uint8array.subarray(offset + 4, offset + 4 + size);\n    }\n\n    function readUTF8(uint8array, offset) {\n        var size = readUInt32(uint8array, offset);\n        if (size > 1024 * 1024) {\n            throw new Error('string too big');\n        }\n        return String.fromCharCode.apply(null, uint8array.slice(offset + 4, offset + 4 + size));\n    }\n\n    function writeUTF8(uint8array, string, offset) {\n        writeUInt32(uint8array, string.length, offset);\n        for (var i = 0; i < string.length; i++ ) {\n            uint8array[offset + 4 + i] = string.charCodeAt(i);\n        }\n    }\n\n    function sizeUTF8(string) {\n        return 4 + string.length;\n    }\n\n    function propUint32(type, name) {\n        return new AlanFrameProp(type, name, fixedSize(4), readUInt32, writeUInt32);\n    }\n\n    function propUint64(type, name) {\n        return new AlanFrameProp(type, name, fixedSize(8), readUInt64, writeUInt64);\n    }\n\n    function propBytes(type, name) {\n        return new AlanFrameProp(type, name, bufferSize, readBuffer, writeBuffer);\n    }\n\n    function propJson(type, name) {\n        return new AlanFrameProp(type, name, sizeUTF8, readUTF8, writeUTF8);\n    }\n\n    AlanFrame.fieldByType = function(type) {\n        for (var i = 0; i < AlanFrame.fields.length; i++ ) {\n            var frame = AlanFrame.fields[i];\n            if (frame.type === type) {\n                return frame;\n            }\n        }\n        throw new Error('invalid field: ' + type);\n    };\n\n    function AlanFrame() {\n        this.version = 1;\n    }\n\n    AlanFrame.prototype.write = function() {\n        var result = new Uint8Array(this.writeSize());\n        var offset = 1;\n        result[0]  = 1;\n        for (var i = 0; i < AlanFrame.fields.length; i++ ) {\n            var field = AlanFrame.fields[i];\n            var value = this[field.name];\n            if (value) {\n                result[offset++] = field.type;\n                field.writeF(result, value, offset);\n                offset += field.sizeF(value);\n            }\n        }\n        return result.buffer;\n    };\n\n    /**\n     * @returns UInt8Array\n     */\n    AlanFrame.prototype.writeSize = function() {\n        var size = 1;\n        for (var i = 0; i < AlanFrame.fields.length; i++ ) {\n            var field = AlanFrame.fields[i];\n            var value = this[field.name];\n            if (value) {\n                size += 1 + field.sizeF(value);\n            }\n        }\n        return size;\n    };\n\n    AlanFrame.prototype.toString = function() {\n        var first = true, str = '';\n        for (var k in this) {\n            if (this.hasOwnProperty(k)) {\n                if (first) {\n                    str += k + ' = ';\n                    first = false;\n                } else {\n                    str += ', ' + k + ' = ';\n                }\n                var v = this[k];\n                if (typeof(v) === 'object') {\n                    str += 'bytes[' + byteLength(v) + ']';\n                } else {\n                    str += v;\n                }\n            }\n        }\n        return str;\n    };\n\n    function byteLength(b) {\n        if (b instanceof Uint8Array) {\n            return b.length;\n        }\n        if (b instanceof ArrayBuffer) {\n            return b.byteLength;\n        }\n    }\n\n    function toArrayBuffer(buffer) {\n        if (buffer instanceof ArrayBuffer) {\n            return buffer;\n        }\n        return buffer.buffer;\n    }\n\n    function toUint8(buffer) {\n        if (buffer instanceof Uint8Array) {\n            return buffer;\n        }\n        if (buffer instanceof ArrayBuffer) {\n            return new Uint8Array(buffer);\n        }\n        throw new Error('invalid buffer type');\n    }\n\n    function parse(uint8array) {\n        uint8array = toUint8(uint8array);\n        var r = new AlanFrame();\n        var offset = 0;\n        r.version = uint8array[offset++];\n        while (offset < uint8array.length) {\n            var frame = AlanFrame.fieldByType(uint8array[offset++]);\n            r[frame.name] = frame.readF(uint8array, offset);\n            offset += frame.sizeF(r[frame.name]);\n        }\n        return r;\n    }\n\n    ns.create = function() {\n        return new AlanFrame();\n    };\n\n    ns.parse = parse;\n\n})(typeof(window)            !== 'undefined' ? (function() {window.alanFrame = {}; return window.alanFrame; })() :\n   typeof(WorkerGlobalScope) !== 'undefined' ? (function() {alanFrame = {}; return alanFrame; })() :\n   exports);\n\n\n'use strict';\n\nvar ALAN_OFF       = 'off';\nvar ALAN_SPEAKING  = 'speaking';\nvar ALAN_LISTENING = 'listening';\n\nfunction ConnectionImpl(config, auth, mode) {\n    var _this = this;\n    this._config = config;\n    this._auth = auth;\n    this._mode = mode;\n    this._projectId = config.projectId;\n    this._url = config.url;\n    this._connected = false;\n    this._authorized = false;\n    this._dialogId = null;\n    this._callId = 1;\n    this._callSent = {};\n    this._callWait = [];\n    this._failed = false;\n    this._closed = false;\n    this._reconnectTimeout = 100;\n    this._cleanups = [];\n    this._format = null;\n    this._formatSent = false;\n    this._frameQueue = [];\n    this._remoteSentTs = 0;\n    this._remoteRecvTs = 0;\n    this._rtt = 25;\n    this._rttAlpha = 1./16;\n    this._alanState = ALAN_OFF;\n    this._sendTimer = setInterval(_this._flushQueue.bind(_this), 50);\n    this._visualState = {};\n    this._addCleanup(function() {clearInterval(_this._sendTimer);});\n    this._connect();\n    console.log('Alan: connection created: ' + this._url);\n}\n\nConnectionImpl.prototype._addCleanup = function(f) {\n    this._cleanups.push(f);\n};\n\nConnectionImpl.prototype._onConnectStatus = function(s) {\n    console.log('Alan: connection status: ' + s);\n    this._fire('connectStatus', s);\n};\n\nConnectionImpl.prototype._fire = function(event, object) {\n    if (event === 'options') {\n        if (object.versions) {\n            object.versions['alanbase:web'] = this._config.version;\n        }\n    }\n    postMessage(['fireEvent', event, object]);\n};\n\nConnectionImpl.prototype._connect = function() {\n    var _this = this;\n    if (this._socket) {\n        console.error('socket is already connected');\n        return;\n    }\n    console.log('Alan: connecting to ' + this._url);\n    this._socket = new WebSocket(this._url);\n    this._socket.binaryType = 'arraybuffer';\n    this._socket.onopen = function(e) {\n        console.info('Alan: connected', e.target === _this._socket);\n        _this._connected = true;\n        _this._reconnectTimeout = 100;\n        _this._fire('connection', {status: 'connected'});\n        if (_this._auth) {\n            _this._fire('connection', {status: 'authorizing'});\n            _this._callAuth();\n        } else {\n            _this._callWait.forEach(function(c) {  _this._sendCall(c); });\n            _this._callWait = [];\n        }\n    };\n    this._socket.onmessage = function(msg) {\n        if (msg.data instanceof ArrayBuffer) {\n            var f = alanFrame.parse(msg.data);\n            if (f.sentTs > 0) {\n                _this._remoteSentTs = f.sentTs;\n                _this._remoteRecvTs = Date.now();\n            } else {\n                _this._remoteSentTs = null;\n                _this._remoteRecvTs = null;\n            }\n            var rtt = 0;\n            if (f.remoteTs) {\n                rtt = Date.now() - f.remoteTs;\n            }\n            _this._rtt = _this._rttAlpha * rtt  + (1 - _this._rttAlpha) * _this._rtt;\n            var uint8 = new Uint8Array(f.audioData);\n            var frame = [];\n            var batch = 10000;\n            for (var offset = 0; offset < uint8.byteLength; offset += batch) {\n                var b = uint8.subarray(offset, Math.min(uint8.byteLength, offset + batch));\n                let a = String.fromCharCode.apply(null, b);\n                frame.push(a);\n            }\n            frame = frame.join('');\n            postMessage(['alanAudio', 'playFrame', frame]);\n        } else if (typeof(msg.data) === 'string') {\n            msg = JSON.parse(msg.data);\n            if (msg.i) {\n                var c = _this._callSent[msg.i];\n                delete _this._callSent[msg.i];\n                if (c && c.callback) {\n                    c.callback(msg.e, msg.r);\n                }\n            } else if (msg.e) {\n                if (msg.e === 'text') {\n                    postMessage(['alanAudio', 'playText', msg.p]);\n                } else if (msg.e === 'showPopup') {\n                    postMessage(['alanAudio', 'showPopup', msg.p]);\n                } else if (msg.e === 'command') {\n                    postMessage(['alanAudio', 'playCommand', msg.p]);\n                } else if (msg.e === 'inactivity') {\n                    postMessage(['alanAudio', 'stop']);\n                } else {\n                    _this._fire(msg.e, msg.p);\n                }\n            }\n        } else {\n            console.error('invalid message type');\n        }\n    };\n    this._socket.onerror = function(evt) {\n        console.error('Alan: connection closed due to error: ', evt);\n    };\n    this._socket.onclose = function(evt) {\n        console.info('Alan: connection closed');\n        _this._connected = false;\n        _this._authorized = false;\n        _this._socket = null;\n        _this._onConnectStatus('disconnected');\n        if (!_this._failed && _this._reconnectTimeout && !_this._closed) {\n            console.log('Alan: reconnecting in %s ms.', _this._reconnectTimeout);\n            _this._reConnect = setTimeout(_this._connect.bind(_this), _this._reconnectTimeout);\n            if (_this._reconnectTimeout < 3000) {\n                _this._reconnectTimeout *= 2;\n            } else {\n                _this._reconnectTimeout += 500;\n            }\n            _this._reconnectTimeout = Math.min(7000, _this._reconnectTimeout);\n        }\n    };\n    this._addCleanup(function() {\n        if (this._socket) {\n            this._socket.close();\n            this._socket = null;\n        }\n    });\n};\n\nConnectionImpl.prototype._callAuth = function() {\n    var _this = this;\n    var callback = function(err, r) {\n        if (!err && r.status === 'authorized') {\n            _this._authorized = true;\n            _this._formatSent = false;\n            if (r.dialogId) {\n                postMessage(['setDialogId', r.dialogId]);\n                _this._dialogId = r.dialogId;\n            }\n            _this._onAuthorized();\n            _this._onConnectStatus('authorized');\n        } else if (err === 'auth-failed') {\n            _this._onConnectStatus('auth-failed');\n            if (_this._socket) {\n                _this._socket.close();\n                _this._socket = null;\n                _this._failed = true;\n            }\n        } else {\n            _this._onConnectStatus('invalid-auth-response');\n            console.log('Alan: invalid auth response', err, r);\n        }\n    };\n    var authParam = this._auth;\n    authParam.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;\n    if (this._dialogId) {\n        authParam.dialogId = this._dialogId;\n    }\n    authParam.mode = this._mode;\n    this._sendCall({cid: this._callId++, method: '_auth_', callback: callback, param: authParam});\n    return this;\n};\n\nConnectionImpl.prototype._sendCall = function(call) {\n    this._sendFormatIfNeeded(false);\n    this._socket.send(JSON.stringify({i: call.cid, m: call.method, p: call.param}));\n    if (call.callback) {\n        this._callSent[call.cid] = call;\n    }\n};\n\nConnectionImpl.prototype._onAuthorized = function() {\n    console.log('Alan: authorized');\n    var _this = this;\n    this._callWait.forEach(function(c) {\n        _this._sendCall(c);\n    });\n    this._callWait = [];\n};\n\nConnectionImpl.prototype.close = function() {\n    for (var i = 0; i < this._cleanups.length; i++ ) {\n        this._cleanups[i]();\n    }\n    this._cleanups = [];\n    this._closed = true;\n    \n    if (this._socket && (this._socket.readyState === WebSocket.OPEN || this._socket.readyState === WebSocket.CONNECTING)) {\n        this._socket.close();\n        this._socket = null;\n    }\n    console.log('Alan: closed connection to: ' + this._url);\n    //close(); TODO: delete it!\n};\n\nConnectionImpl.prototype.call = function(cid, method, param) {\n    var call = {cid: cid, method: method, param: param, callback: function(err, obj) {\n        if (cid) {\n            postMessage(['callback', cid, err, obj]);\n        }\n    }};\n    if (this._authorized || this._connected && !this._auth) {\n        this._sendCall(call);\n    } else {\n        this._callWait.push(call);\n    }\n};\n\nConnectionImpl.prototype.setVisual = function(state) {\n    this._visualState = state;\n    this.call(null, '_visual_', state);\n};\n\nConnectionImpl.prototype._sendFrame = function(frame) {\n    if (!this._socket) {\n        console.error('sendFrame to closed socket');\n        return;\n    }\n    frame.sentTs = Date.now();\n    if (this._remoteSentTs > 0 && this._remoteRecvTs > 0) {\n        frame.remoteTs = this._remoteSentTs + Date.now() - this._remoteRecvTs;\n    }\n    this._socket.send(frame.write());\n};\n\nConnectionImpl.prototype._listen = function() {\n    var f = alanFrame.create();\n    f.jsonData = JSON.stringify({signal: 'listen'});\n    this._frameQueue.push(f);\n    this._alanState = ALAN_LISTENING;\n};\n\nConnectionImpl.prototype._stopListen = function() {\n    var f = alanFrame.create();\n    f.jsonData = JSON.stringify({signal: 'stopListen'});\n    this._frameQueue.push(f);\n    this._alanState = ALAN_OFF;\n};\n\nConnectionImpl.prototype._onAudioFormat = function(format) {\n    console.log('_onAudioFormat', format);\n    this._formatSent = false;\n    this._format = format;\n};\n\nConnectionImpl.prototype._onMicFrame = function(sampleRate, frame) {\n    if (this._alanState === ALAN_SPEAKING) {\n        return;\n    }\n    if (this._alanState === ALAN_OFF) {\n        this._listen();\n    }\n    if (this._alanState !== ALAN_LISTENING) {\n        console.error('invalid alan state: ' + this._alanState);\n        return;\n    }\n    this._sendFormatIfNeeded(true);\n    var f = alanFrame.create();\n    f.audioData = frame;\n    this._frameQueue.push(f);\n};\n\nConnectionImpl.prototype._sendFormatIfNeeded = function(inQueue) {\n    if (!this._format || this._formatSent) {\n        return;\n    }\n    this._formatSent = true;\n    var f = alanFrame.create();\n    f.jsonData = JSON.stringify({format: this._format});\n    if (inQueue) {\n        this._frameQueue.push(f);\n    } else {\n        this._sendFrame(f);\n    }\n};\n\nConnectionImpl.prototype._flushQueue = function() {\n    if (!this._socket || !this._connected) {\n        var d = 0;\n        while (this._frameQueue.length > 100 && !this._frameQueue[0].jsonData) {\n            this._frameQueue.shift();\n            d++;\n        }\n        if (d > 0) {\n            console.error('dropped: %s, frames', d);\n        }\n        return;\n    }\n    while (this._frameQueue.length > 0 && this._socket && this._socket.bufferedAmount < 64 * 1024) {\n        this._sendFrame(this._frameQueue.shift());\n    }\n};\n\nfunction connectProject(config, auth, mode) {\n    var c = new ConnectionImpl(config, auth, mode);\n    c.onAudioEvent = function(event, arg1, arg2) {\n        if (event === 'format') {\n            c._onAudioFormat(arg1);\n        } else if (event === 'frame') {\n            c._onMicFrame(arg1, arg2);\n        } else if (event === 'micStop' || event === 'playStart') {\n            c._stopListen();\n        } else {\n            console.error('unknown audio event: ' + event, arg1, arg2);\n        }\n    };\n    return c;\n}\n\nvar factories = {\n    connectProject: connectProject,\n};\n\nvar currentConnect = null;\n\nonmessage = function(e) {\n    var name = e.data[0];\n    try {\n        if (!currentConnect) {\n            currentConnect = factories[name].apply(null, e.data.slice(1, e.data.length));\n        } else {\n            currentConnect[name].apply(currentConnect, e.data.slice(1, e.data.length));\n        }\n    } catch(e) {\n        console.error('error calling: ' + name, e);\n    }\n};\n"]),{type: 'text/javascript'}));
        this._worker.onmessage = function(e) {
            if (e.data[0] === 'fireEvent') {
                _this._fire(e.data[1], e.data[2]);
                return;
            }
            if (e.data[0] === 'alanAudio') {
                if (e.data[1] === 'playText') {
                    alanAudio.playText(e.data[2]);
                    return;
                }
                if (e.data[1] === 'playAudio' || e.data[1] === 'playFrame') {
                    alanAudio.playAudio(e.data[2]);
                    return;
                }
                if (e.data[1] === 'playEvent' || e.data[1] === 'playCommand') {
                    alanAudio.playEvent(e.data[2]);
                    return;
                }
                if (e.data[1] === 'showPopup') {
                    alanAudio.showPopup(e.data[2]);
                    return;
                }
                if (e.data[1] === 'stop') {
                    alanAudio.stop();
                    return;
                }
            }
            if (e.data[0] === "callback") {
                _this._callback[e.data[1]](e.data[2], e.data[3]);
                delete _this._callback[e.data[1]];
                return;
            }
            if (e.data[0] === "setDialogId") {
                _this._dialogId = e.data[1];
                return;
            }
            console.error("invalid event", e.data);
        };
        this._worker.onerror = function(e) {
            console.error("error in worker: " + e.filename + ":" + e.lineno + " - " +  e.message);
        };
        this._handlers = {};
        this._cleanups = [];
        this._callback = {};
        this._callIds  = 1;
        this._config   = {};
    }

    ConnectionWrapper.prototype.on = function(event, handler) {
        var h = this._handlers[event];
        if (!h) {
            h = [];
            this._handlers[event] = h;
        }
        h.push(handler);
    };

    ConnectionWrapper.prototype.off = function(event, handler) {
        var h = this._handlers[event];
        if (h) {
            var index = h.indexOf(handler);
            if (index >= 0) {
                h.splice(index, 1);
            }
        }
    };

    ConnectionWrapper.prototype.getSettings = function() {
        return {
            server: config.baseURL,
            projectId: this._config.projectId,
            dialogId: this._dialogId,
        };
    };

    ConnectionWrapper.prototype.setVisual = function(state) {
        this._worker.postMessage(['setVisual', state]);
    };

    ConnectionWrapper.prototype.call = function(method, param, callback) {
        var cid = null;
        if (callback) {
            cid = this._callIds++;
            this._callback[cid] = callback;
        }
        this._worker.postMessage(['call', cid, method, param]);
    };

    ConnectionWrapper.prototype.close = function() {
        console.log('closing connection to: ' + this._url);
        this._cleanups.forEach(function (h) { h();});
        this._worker.postMessage(['close']);
        this._worker.terminate();
    };

    ConnectionWrapper.prototype._fire = function(event, object) {
        var h = this._handlers[event];
        if (h) {
            for (var i = 0; i < h.length; i++ ) {
                h[i](object);
            }
        }
    };

    ConnectionWrapper.prototype._addCleanup = function(f) {
        this._cleanups.push(f);
    };

    function fillAuth(values, ext) {
        var auth = {};
        for (var k in values) {
            auth[k] = values[k];
        }

        if (!ext || (ext && ext.platform == null)) {
            auth.platform = config.platform;
        } else {
            auth.platform = config.platform + ":" + ext.platform;
        }
        if (!ext || (ext && ext.platformVersion == null)) {
            auth.platformVersion = config.version;
        } else {
            auth.platformVersion = config.version + ":" + ext.platformVersion;
        }
        if (ext && ext.appName) {
            auth.appName = ext.appName;
        }
        return auth;
    }

    function isProjectIdValid(projectId) {
        return projectId.match(/^[A-Z0-9]{64}\/(prod|stage|testing)$/gi);
    }
                            
    function connectProject(projectId, auth,  host, mode, ext) {
        var connect = new ConnectionWrapper();
        if (host)  {
            config.baseURL = "wss://" + host;
        }
        connect._config.projectId = projectId;
        connect._config.codec     = config.codec;
        connect._config.version   = config.version;
        connect._config.url       = config.baseURL + "/ws_project/" + projectId;

        if (!isProjectIdValid(projectId)) {
            throw new Error("Wrong projectId was provided");
        }

        connect._worker.postMessage(["connectProject", connect._config, fillAuth(auth, ext), mode]);
        function signupEvent(name, handler) {
            alanAudio.on(name, handler);
            connect._addCleanup(function() {
                alanAudio.off(name,  handler);
            });
        }
        function passEventToWorker(name) {
            function handler(a1, a2) {
                if (name === 'frame' && alanAudio.isPlaying()) {
                    return;
                }
                connect._worker.postMessage(['onAudioEvent', name, a1, a2]);
            }
            signupEvent(name, handler);
        }
        function passEventToClient(name) {
            function handler(e1) {
                connect._fire(name, e1);
            }
            signupEvent(name, handler);
        }
        passEventToWorker('frame');
        passEventToWorker('micStop');
        passEventToWorker('playStart');
        passEventToClient('text');
        passEventToClient('command');
        connect._worker.postMessage(['onAudioEvent', 'format', alanAudio.getFormat()]);
        return connect;
    }

    function connectProjectTest(projectId, auth,  host, mode, ext) {
        var connect = new ConnectionWrapper();
        if (host)  {
            config.baseURL = "wss://" + host;
        }
        connect._config.projectId = projectId;
        connect._config.codec     = config.codec;
        connect._config.version   = config.version;
        connect._config.url       = config.baseURL + "/ws_project/" + projectId;

        if (!isProjectIdValid(projectId)) {
            throw new Error("Wrong projectId was provided");
        }

        connect._worker.postMessage(["connectProject", connect._config, fillAuth(auth, ext), mode]);
        function signupEvent(name, handler) {
            alanAudio.on(name, handler);
            connect._addCleanup(function() {
                alanAudio.off(name,  handler);
            });
        }
        function passEventToWorker(name) {
            function handler(a1, a2) {
                if (name === 'frame' && alanAudio.isPlaying()) {
                    return;
                }
                connect._worker.postMessage(['onAudioEvent', name, a1, a2]);
            }
            signupEvent(name, handler);
        }
        function passEventToClient(name) {
            function handler(e1) {
                connect._fire(name, e1);
            }
            signupEvent(name, handler);
        }
        passEventToWorker('frame');
        passEventToWorker('micStop');
        passEventToWorker('playStart');
        passEventToClient('text');
        passEventToClient('command');
        return connect;
    }

    function connectTutor(auth, host) {
        var connect = new ConnectionWrapper();
        if (host)  {
            config.baseURL = "wss://" + host;
        }
        connect._config.version = config.version;
        connect._config.url = config.baseURL + "/ws_tutor";
        connect._worker.postMessage(["connectProject", connect._config, auth]);
        return connect;
    }

    ns.alanSDKVersion = config.version;

    ns.alan = {
        sdkVersion: config.version,
        diagnostic: ns.alanDiagnostic,
        projectTest: connectProjectTest,
        project: connectProject,
        tutor: connectTutor,
    };

})(window);

(function(ns) {
    "use strict";

    var PLAY_IDLE    = 'playIdle';
    var PLAY_ACTIVE  = 'playActive';
    var PLAY_STOPPED = 'playStopped';

    var MIC_IDLE     = 'micIdle';
    var MIC_ACTIVE   = 'micActive';
    var MIC_STOPPED  = 'micStopped';

    var AUDIO_RUNNING = 'audioRunning';

    var config = {
        bufferLength: 4096,
        sampleRate:   16000,
        encoderApplication: 2048,
        encodePCM:    false,
        micTimeout:   4000,
    };

    var handlers     = {};
    var micState     = MIC_STOPPED;
    var playState    = PLAY_STOPPED;
    var audioQueue   = [];
    var audioElement = null;
    var audioContext = null;
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var stopMicTimer = null;
    var skipFrame = false;

    var isIE         = false || !!document.documentMode;
    var isEdge       = !isIE && !!window.StyleMedia;
    var isChrome     = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    if (isEdge || isChrome) {
        audioContext = new AudioContext({sampleRate: config.sampleRate});
    } else {
        audioContext = new AudioContext();
    }
    console.log('audioContext.sampleRate = ', audioContext.sampleRate, 'state = ', audioContext.state);
    audioContext.resume().then(()=> fireEvent(AUDIO_RUNNING));

    var microphoneStream = null;
    var microphoneNode = null;
    var gainNode = audioContext.createGain();
    var encoderNode = audioContext.createScriptProcessor(config.bufferLength, 1, 1);
    encoderNode.onaudioprocess = ({inputBuffer}) => encodeBuffers(inputBuffer);
    encoderNode.connect(audioContext.destination);

    if (encoder.start) {
        encoder.start();
    }
    var encoderCallback = ({data}) => {
        switch (data['message']) {
            case 'ready':
                console.log('audio worker initialized');
                break;
            case 'page':
                fireEvent('frame', config.sampleRate, data['page']);
                break;
            case 'done':
                encoder.removeEventListener("message", encoderCallback);
                break;
            case 'print':
                console.log('AUDIO-WORKER', data.text);
                break;
        }
    };
    encoder.addEventListener('message', encoderCallback);
    encoder.postMessage({
        command: 'init',
        originalSampleRate: audioContext.sampleRate,
        encoderSampleRate: config.sampleRate,
        encoderApplication: config.encoderApplication,
        encodePCM: config.encodePCM,
    });

    function openMicrophone() {
        if (microphoneNode) {
            return Promise.resolve(microphoneNode);
        }
        return navigator.mediaDevices.getUserMedia({audio : true}).then(stream => {
            fireEvent('micAllowed');
            microphoneStream = stream;
            microphoneNode = audioContext.createMediaStreamSource(stream);
            microphoneNode.connect(gainNode);
            gainNode.connect(encoderNode);
        });
    }

    function encodeBuffers(inputBuffer) {
        if (micState !== MIC_ACTIVE || playState === PLAY_ACTIVE || skipFrame) {
            return;
        }
        var buffers = [inputBuffer.getChannelData(0)];
        encoder.postMessage({
            command: "encode",
            buffers: buffers
        });
    }

    function getAudioElement() {
        if (audioElement) {
            return audioElement;
        }
        audioElement = document.createElement("audio");
        audioElement.addEventListener("ended", function() {
            playState = PLAY_IDLE;
            _handleQueue(true);
        });
        document.body.appendChild(audioElement);
        audioElement.setAttribute("autoplay", "true");
        return audioElement;
    }

    function _handleQueue(nowPlaying) {
        if (audioContext.state === 'suspended') {
            return;
        }
        if (nowPlaying && !audioQueue.length) {
            onPlayStop();
        }
        if (!audioQueue.length || playState === PLAY_ACTIVE) {
            return;
        }
        while (audioQueue.length && playState !== PLAY_ACTIVE) {
            var o = audioQueue.shift();
            if (o.event) {
                fireEvent('command', o.event);
            } else if (o.text) {
                fireEvent('text', o.text);
            } else if (o.popup) {
                fireEvent('popup', o.popup);
            } else if (o.audio) {
                if (playState === PLAY_IDLE) {
                    playState = PLAY_ACTIVE;
                    fireEvent('playStart');
                    getAudioElement().setAttribute("src", o.audio);
                }
            } else {
                console.error('invalid queue item');
            }
        }
        if (nowPlaying && playState !== PLAY_ACTIVE) {
            onPlayStop();
        }
    }

    function onPlayStop() {
        fireEvent('playStop');
    }

    function fireEvent(event, o1, o2) {
        var h = handlers[event];
        if (h) {
            for (var i = 0; i < h.length; i++ ) {
                h[i](o1, o2);
            }
        }
    }

    ns.getFormat = function() {
        if (config.encodePCM) {
            return {
                send: {codec: 'pcm_f32le',  sampleRate: 16000},
                recv: {codec: 'mp3;base64', sampleRate: 16000},
            };
        } else {
            return {
                send: {codec: 'opus',       sampleRate: 16000},
                recv: {codec: 'mp3;base64', sampleRate: 16000},
            };
        }
    };

    ns.isAudioRunning = function() {
        return audioContext && audioContext.state === 'running';
    };

    ns.isPlaying = function() {
        return playState === PLAY_ACTIVE;
    };

    ns.playText = function(text) {
        audioContext.resume().then(()=> {
            audioQueue.push({text: text});
            _handleQueue();
        });
    };

    ns.playCommand = function(command) {
        audioContext.resume().then(()=> {
            audioQueue.push({event: command});
            _handleQueue();
        });
    };

    ns.showPopup = function(popup) {
        if (popup.popup.force) {
            fireEvent("popup", popup);
        } else {
            audioContext.resume().then(()=> {
                audioQueue.push({popup: popup});
                _handleQueue();
            });
        }
    };

    ns.playEvent = function(event) {
        ns.playCommand(event);
    };

    ns.playAudio = function(audio) {
        audioContext.resume().then(()=> {
            audioQueue.push({audio: audio});
            _handleQueue();
        });
    };

    ns.on = function(event, handler) {
        var h = handlers[event];
        if (h == null) {
            handlers[event] = [handler];
        } else {
            h.push(handler);
        }
    };

    ns.off = function(event, handler) {
        var h = handlers[event];
        if (h) {
            var index = h.indexOf(handler);
            if (index >= 0) {
                h.splice(index, 1);
            }
        }
    };

    ns.resumeAudioCtx = function() {
        audioContext.resume();
    };

    var micAllowed = false;

    function setMicAllowed(value) {
        micAllowed = value;
    }

    ns.isMicAllowed = function() {
        return micAllowed;
    }

    ns.start = function(onStarted) {
        if (stopMicTimer) {
            clearTimeout(stopMicTimer);
            stopMicTimer = null;
        }
        // if (micState === MIC_ACTIVE) {
        //     return;
        // }
        getAudioElement().setAttribute("src", "");
        playState = PLAY_IDLE;
        openMicrophone()
            .then(()=> { 
                micState = MIC_ACTIVE;
                fireEvent('micStart');
            })
            .then(()=> { setMicAllowed(true); audioContext.resume();})
            .catch(err => { fireEvent('micFail', err); });
        if (onStarted) {
            onStarted();
            onStarted = null;
        }
    };

    ns.stop = function() {
        if (microphoneNode) {
            micState = MIC_IDLE;
        }
        if (stopMicTimer) {
            clearTimeout(stopMicTimer);
            stopMicTimer = null;
        }
        stopMicTimer = setTimeout(stopMicrophone, config.micTimeout);
        fireEvent('micStop');
        playState = PLAY_STOPPED;
        audioQueue = [];
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
            audioElement.src = "";
        }
    };

    ns.skipExternalSounds = function(skip) {
        skipFrame = skip;
    };

    function stopMicrophone() {
        console.log('stopping the mic.');
        micState = MIC_STOPPED;
        if (microphoneNode) {
            microphoneNode.disconnect();
            microphoneNode = null;
        }
        gainNode.disconnect();
        if (microphoneStream) {
            if (microphoneStream.getTracks) {
                microphoneStream.getTracks().forEach(track => track.stop());
            } else {
                microphoneStream.stop();
            }
            microphoneStream = null;
        }
    }

})(typeof(window) !== 'undefined' ? (function() {window.alanAudio = {}; return window.alanAudio})() : exports);

(function(ns) {
    "use strict";

    var alanButtonVersion = '1.8.27';

    if (window.alanBtn) {
        console.warn('Alan: the Alan Button source code has already added (v.' + alanButtonVersion + ')');
    }

    var alanAltText = 'Alan voice assistant';
    var currentProjectId = null;
    var deviceId;
    var firstClick = null;

    // Define base properties for disable/enable button functionality
    var isLocalStorageAvailable = false;

    try {
        localStorage.getItem('test');
        isLocalStorageAvailable = true;
    } catch (e) {
        isLocalStorageAvailable = false;
    }

    var isSessionStorageAvailable = false;

    try {
        sessionStorage.getItem('test');
        isSessionStorageAvailable = true;
    } catch (e) {
        isSessionStorageAvailable = false;
    }

    function getDebugInfo() {
        var info = '\nDebug Info:\n';

        info += 'alanBtn: v.' + alanButtonVersion + '\n';
        info += 'alanSDK: v.' + window.alanSDKVersion + '\n';
        info += 'projectId: ' + (currentProjectId || 'unknown')  + '\n';
        info += 'deviceId: ' + getDeviceId()  + '\n';

        info += 'navigator: \n';

        info += 'getUserMedia: ';
        info += navigator.getUserMedia ? '1' : '0';
        info += ', ';

        info += 'mediaDevices: ';
        info += (navigator.mediaDevices) ? '1' : '0';
        info += ', ';

        info += 'mediaDevices.getUserMedia: ';
        info += (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? '1' : '0';
        info += ', ';

        info += 'webkitGUM: ';
        info += navigator.webkitGetUserMedia ? '1' : '0';
        info += ', ';

        info += 'mozGUM: ';
        info += navigator.mozGetUserMedia ? '1' : '0';
        info += ', ';

        info += 'msGUM: ';
        info += navigator.msGetUserMedia ? '1' : '0';
        info += '\n';

        info += 'window: \n';

        info += 'AudioContext: ';
        info += window.AudioContext ? '1' : '0';
        info += ', ';

        info += 'webkitAC: ';
        info += window.webkitAudioContext ? '1' : '0';
        info += ', ';

        info += 'mozAC: ';
        info += window.mozAudioContext ? '1' : '0';
        info += '\n';

        info += 'userAgent: ';
        info += navigator.userAgent;

        return info;
    }

    function getDeviceId() {
        var deviceIdKey = 'alan-btn-uuid-' + currentProjectId;

        if (isLocalStorageAvailable) {
            deviceId = localStorage.getItem(deviceIdKey);
        }

        if (!deviceId) {
            deviceId = guid();
            if (isLocalStorageAvailable) {
                localStorage.setItem(deviceIdKey, deviceId);
            }
        }
        return deviceId;
    }

    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
        }
    
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }


function alanBtn(options) {

    options = options || {};

    var btnDisabled = false;
    var hideS2TPanel = false;
    var pinned = false;
    var absolutePosition = false;
    var micWasStoppedByTimeout = false;
    var keepButtonPositionAfterDnD = false;
    
    console.log('Alan: v.' + alanButtonVersion);

    var btnInstance = {
        // Common public API
        version: alanButtonVersion,
        setVisualState: function (visualState) {
            if (btnDisabled) {
                return;
            }

            if (window.tutorProject) {
                window.tutorProject.setVisual(visualState);
            }
        },
        callProjectApi: function (funcName, data, callback) {
            var funcNamePrefix = 'script::';
            if (btnDisabled) {
                return;
            }
            if (!funcName) {
                throw new Error('Function name for callProjectApi must be provided');
            }

            if (window.tutorProject) {
                if (funcName.indexOf(funcNamePrefix) === 0) {
                    window.tutorProject.call(funcName, data, callback);
                } else {
                    window.tutorProject.call(funcNamePrefix + funcName, data, callback);
                }
            }
        },
        playText: function (text) {
            if (btnDisabled) {
                return;
            }

            if (window.tutorProject) {
                window.tutorProject.call('play', {
                    text: text
                });
            }
        },
        playCommand: function (command) {
            if (btnDisabled) {
                return;
            }

            alanAudio.playCommand({
                data: command
            });
        },
        activate: function () {
            return activateAlanButton();
        },
        deactivate: function () {
            if (btnDisabled) {
                return;
            }

            alanAudio.stop();
        },
        isActive: function () {
            return isAlanActive;
        },
        //deprecated
        callClientApi: function (method, data, callback) {
            if (btnDisabled) {
                return;
            }

            if (window.tutorProject) {
                window.tutorProject.call(method, data, callback);
            }
        },
        // deprecated
        setAuthData: function (data) {
            if (btnDisabled) {
                return;
            }

            if (window.tutorProject) {
                window.tutorProject.close();
                window.tutorProject = alan.project(options.key, getAuthData(data), options.host);
                window.tutorProject.on('connectStatus', onConnectStatusChange);
                window.tutorProject.on('options', onOptionsReceived);
            }
        },
        // Other methods
        setOptions: function (options) {
            onOptionsReceived(options);
        },
        setPreviewState: function (state) {
            switchState(state);
        },
        remove: function () {
            alanAudio.stop();
            window.tutorProject.close();
            rootEl.remove();
        },
        stop: function () {
            alanAudio.stop();
        },
        updateButtonState: function (state) {
            onConnectStatusChange(state);
        },
        sendEvent: sendUserEvent
    };

    document.addEventListener('click', resumeAudioCtx);

    function resumeAudioCtx() {
        alanAudio.resumeAudioCtx();
        document.removeEventListener('click', resumeAudioCtx);
    }

    function sendUserEvent(eventName, eventValue) {
        var obj = eventValue ? {name: eventName, value: eventValue} : {name: eventName};
        // var obj = {};
        // obj[eventName] = eventValue ? eventValue : true;
        sendClientEvent(obj);
    }

    function sendClientEvent(param) {
        if (window.tutorProject) {
            window.tutorProject.call('clientEvent', param);
        } else {
            setTimeout(() => sendClientEvent(param), 3000);
        }
    }


    //Host
    var host = 'studio.alan.app';
    var baseUrl = 'https://' + ((host.indexOf('$') === 0 || host === '') ? window.location.host : host);

    if (options.host) {
        baseUrl = 'https://' + options.host;
    }

    // Btn modes
    var mode;

    if (options.mode === 'tutor') {
        mode = 'tutor';
        pinned = true;
    } else if (options.mode === 'demo') {
        mode = 'demo';
    } else {
        mode = 'component';
    }

    if (options.position === 'absolute' || options.pinned) {
        pinned = true;
    }

    if (options.position === 'absolute') {
        absolutePosition = true;
    }

    var btnStateMapping = {
        'default': 'ONLINE',
        'offline': 'OFFLINE',
        'disconnected': 'CONNECTING',
        'listening': 'LISTEN',
        'understood': 'PROCESS',
        'intermediate': 'PROCESS',
        'speaking': 'REPLY',
    };

    // Btn states
    var DEFAULT = 'default';
    var LISTENING = 'listening';
    var SPEAKING = 'speaking';
    var INTERMEDIATE = 'intermediate';
    var UNDERSTOOD = 'understood';
    var DISCONNECTED = 'disconnected';
    var OFFLINE = 'offline';
    var LOW_VOLUME = 'lowVolume';
    var PERMISSION_DENIED = 'permissionDenied';
    var NO_VOICE_SUPPORT = 'noVoiceSupport';
    var NOT_SECURE_ORIGIN = 'notSecureOrigin';

    // Error messages
    var MIC_BLOCKED_MSG = 'Microphone access is blocked in your browser settings. Enable it to allow the voice assistant using your microphone';
    var NO_VOICE_SUPPORT_IN_BROWSER_MSG = 'Your browser doesn’t support voice input. If you think your browser supports voice input, please send the Debug info below to support@alan.app. ' + getDebugInfo();
    var NOT_SECURE_ORIGIN_MSG = 'Audio is allowed only on a secure connection: make sure your connection protocol is under HTTPS, HTTP on localhost or file. A connection over the file protocol may not work in some browsers, e.g., in Safari. Now you are running with "' + window.location.protocol + '" protocol and "' + window.location.hostname + '" hostname';
    var LOW_VOLUME_MSG = 'Low volume level';
    var OFFLINE_MSG = 'You\'re offline';
    var currentErrMsg = null;


    var NO_VOICE_SUPPORT_IN_BROWSER_CODE = 'browser-does-not-support-voice-input';
    var MIC_BLOCKED_CODE = 'microphone-access-blocked';
    var PREVIEW_MODE_CODE = 'preview-mode';
    var BTN_IS_DISABLED_CODE = 'btn-is-disabled';
    var NO_ALAN_AUDIO_INSANCE_WAS_PROVIDED_CODE = 'no-alan-audio-instance-was-provided';

    // Set default state for btn
    var state = DISCONNECTED;
    var previousState = null;
    var isAlanSpeaking = false;
    var isAlanActive = false;

    // Set btn position flags
    var isLeftAligned = false;
    var isRightAligned = true;
    var isTopAligned = false;
    var isBottomAligned = false;

    var recognisedTextVisible = false;
    var playReadyToListenSound = true;

    var turnOffTimeout = 30000;
    var turnOffVoiceFn;

    // Dnd variables
    var dndInitMousePos = [0, 0];
    var dndIsDown = false;
    var btnWasMoved = false;
    var afterMouseMove = false;
    var dndFinalHorPos = null;
    var dndBtnLeftPos = 0;
    var dndBtnTopPos;
    var dndAnimDelay = 300;
    var tempDeltaX = 0, tempDeltaY = 0;
    var dndAnimTransition = dndAnimDelay + 'ms';
    var dndBackAnimFinished = true;

    function setTurnOffVoiceTimeout() {
        turnOffVoiceFn = debounce(function () {
            if (isAlanSpeaking) {
                // console.info('BTN: CONTINUE alanAudio', new Date());
                turnOffVoiceFn();
            } else {
                // console.info('BTN: STOP alanAudio', new Date());
                alanAudio.stop();
                micWasStoppedByTimeout = true;
            }
        }, turnOffTimeout);
    }

    setTurnOffVoiceTimeout();

    var switchToLowVolumeStateTimer = null;

    // Css animations
    var pulsatingAnimation = '';
    var pulsatingMicAnimation = '';
    var pulsatingTriangleMicAnimation = '';
    if (!isPreviewMode()) {
        pulsatingAnimation = 'alan-pulsating 2s ease-in-out infinite';
        pulsatingMicAnimation = 'alan-mic-pulsating 1.4s ease-in-out infinite';
        pulsatingTriangleMicAnimation = 'alan-triangle-mic-pulsating 1.2s ease-in-out infinite';
    }

    var gradientAnimation = 'alan-gradient 3s ease-in-out infinite';
    var disconnectedLoaderAnimation = 'disconnected-loader-animation 2s linear infinite';

    // Set alanAudio
    var alanAudio = window.alanAudio;

    // Define base blocks and layers
    var rootEl = options.rootEl || document.createElement('div');
    var body = document.getElementsByTagName('body')[0];
    var btn = document.createElement('div');

    var micIconSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAH9SURBVHgB7dvvUcIwGMfxByfADdjAEdQN3EA2YATcAJ2AEXADdALcgG4AGzwm13DQkNKWQBvK93OXF4W0Z36mf5IUEQAAAAAAAAAAgPOo6ocpS91bmfIuOM2ENHJhlVnbOoIwF1CVleCYCWas9U0kEQ+SjibXuDdJxEASYbtVg+rbwWDwKAm41QDFBJjE357SKXyTCDASAUYiwEgEGIkAIxFgJAKMRICRWgvQTRZs3IzLxef2rn38zmlxqmoT+L6Rpse/ltbGk36j/bFsKJRTqvZva6zc2TXQtHfofbSV+rYVx2pNmwFm3vbI2/6R+r4rjvUnLWkzQL9Rz972l9T3WXGsTPrGTsN794FloM5Uq00D+/kLUb28Cw8DYbwE6k1LgrOPKJNA/dBaykj6SItrvdZaAzcAzZc3bTBzVyYl9YZ6vJK3kL6yPS7QW+ZyJhvW3fS+HdPAWaDRiyYNdz1vecl/xs0oOe12p3Plxd+d2mX7t/482MnKlutt9i48CnydSf5M+Cv7xxFb78mUsSnDkn1ezeAjk3uh+Y0i1JOaWuu9vi/jTueZns/u29kwLhma98Z5g+CWpjwLirT4/Oezn01S63HJvNrhs4kdbqfyKoePKf1IBBiJACMRYCQCjESAkVIO8HDhKBM0o/tZFzsTzY9sAAAAAAAAAABAjH+9EqX09fBHaQAAAABJRU5ErkJggg==';
    var roundedTriangleSecondLayerSrc = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1pbm5lci1zaGFwZTwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPgogICAgICAgIDxsaW5lYXJHcmFkaWVudCB4MT0iMTAwJSIgeTE9IjMuNzQ5Mzk5NDZlLTMxJSIgeDI9IjIuODYwODIwMDklIiB5Mj0iOTcuMTM5MTc5OSUiIGlkPSJsaW5lYXJHcmFkaWVudC0xIj4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzAwMDAwMCIgc3RvcC1vcGFjaXR5PSIwLjEyIiBvZmZzZXQ9IjAlIj48L3N0b3A+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiMwMDAwMDAiIHN0b3Atb3BhY2l0eT0iMC4wNCIgb2Zmc2V0PSIxMDAlIj48L3N0b3A+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KICAgIDxnIGlkPSJBbGFuLUJ1dHRvbi0vLUFuaW1hdGlvbi0vLWJ1dHRvbi1pbm5lci1zaGFwZSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPHBhdGggZD0iTTQwLjEwMDU0MjIsOSBMNDAuMTAwNTQyMiw5IEM1MC4wNzA0NzUxLDkgNTkuMTUxNjIzNSwxNC43MzM3OTM4IDYzLjQzODA5OCwyMy43MzUyMjE0IEw3MC40MjIwMjY3LDM4LjQwMTE5NyBDNzUuMTcxMDE0NSw0OC4zNzM4ODQ0IDcwLjkzNjM2OTMsNjAuMzA4MTYwMSA2MC45NjM2ODE5LDY1LjA1NzE0NzggQzU4LjI3NzU5NDksNjYuMzM2MjYwOCA1NS4zMzk5NzQ0LDY3IDUyLjM2NDg3ODksNjcgTDI3LjgzNjIwNTQsNjcgQzE2Ljc5MDUxMDQsNjcgNy44MzYyMDU0Myw1OC4wNDU2OTUgNy44MzYyMDU0Myw0NyBDNy44MzYyMDU0Myw0NC4wMjQ5MDQ1IDguNDk5OTQ0NTksNDEuMDg3Mjg0IDkuNzc5MDU3NiwzOC40MDExOTcgTDE2Ljc2Mjk4NjQsMjMuNzM1MjIxNCBDMjEuMDQ5NDYwOCwxNC43MzM3OTM4IDMwLjEzMDYwOTIsOSA0MC4xMDA1NDIyLDkgWiIgaWQ9ImlubmVyLWJnIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50LTEpIj48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg==\n';
    var circleSecondLayerSrc = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1pbm5lci1zaGFwZS1zcGVha2luZyBiYWNrPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IHgxPSIxMDAlIiB5MT0iMy43NDkzOTk0NmUtMzElIiB4Mj0iMi44NjA4MjAwOSUiIHkyPSI5Ny4xMzkxNzk5JSIgaWQ9ImxpbmVhckdyYWRpZW50LTEiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMDAwMDAwIiBzdG9wLW9wYWNpdHk9IjAuMTIiIG9mZnNldD0iMCUiPjwvc3RvcD4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzAwMDAwMCIgc3RvcC1vcGFjaXR5PSIwLjA0IiBvZmZzZXQ9IjEwMCUiPjwvc3RvcD4KICAgICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPC9kZWZzPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLWlubmVyLXNoYXBlLXNwZWFraW5nLWJhY2siIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxjaXJjbGUgaWQ9ImlubmVyLWJnIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50LTEpIiBjeD0iNDAiIGN5PSI0MCIgcj0iMzIiPjwvY2lyY2xlPgogICAgPC9nPgo8L3N2Zz4=\n';
    
    var micIconDiv = document.createElement('div');

    var defaultStateBtnIconImg = document.createElement('img');
    var listenStateBtnIconImg = document.createElement('img');
    var processStateBtnIconImg = document.createElement('img');
    var replyStateBtnIconImg = document.createElement('img');

    var logoState1 = document.createElement('img');
    var logoState2 = document.createElement('img');
    var logoState3 = document.createElement('img');
    var logoState4 = document.createElement('img');
    var logoState5 = document.createElement('img');
    var logoState6 = document.createElement('img');
    var logoState7 = document.createElement('img');
    var logoState8 = document.createElement('img');
    var logoState9 = document.createElement('img');
    var logoState10 = document.createElement('img');
    
    var roundedTriangleIconDiv = document.createElement('div');
    var circleIconDiv = document.createElement('div');

    var disconnectedMicLoaderIconImg = document.createElement('img');
    var lowVolumeMicIconImg = document.createElement('img');
    var noVoiceSupportMicIconImg = document.createElement('img');
    var offlineIconImg = document.createElement('img');

    var recognisedTextHolder = document.createElement('div');
    var recognisedTextContent = document.createElement('div');
    var soundOnAudioDoesNotExist = false;
    var soundOffAudioDoesNotExist = false;
    var soundNextAudioDoesNotExist = false;
    var soundNextColdPlay = true;
    var soundOnAudio = new Audio('data:audio/mp4;base64,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');
    soundOnAudio.onerror = function() {
        soundOnAudioDoesNotExist = true;
    };
    var soundOffAudio = new Audio('data:audio/mp4;base64,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');
    soundOffAudio.onerror = function() {
        soundOffAudioDoesNotExist = true;
    };
    var soundNextAudio = new Audio('data:audio/mp4;base64,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');
    soundNextAudio.onerror = function() {
        soundNextAudioDoesNotExist = true;
    };
    soundNextAudio.onended = function () {
        if (soundNextColdPlay) return;
        setTimeout(function () {
            alanAudio.skipExternalSounds(false);
        }, 100);
    };
    soundNextAudio.onplay = function () {
        if (soundNextColdPlay) return;
        alanAudio.skipExternalSounds(true);
    };

    // Specify layers for different statets to make smooth animation
    var btnBgDefault = document.createElement('div');
    var btnBgListening = document.createElement('div');
    var btnBgSpeaking = document.createElement('div');
    var btnBgIntermediate = document.createElement('div');
    var btnBgUnderstood = document.createElement('div');

    // Specify layers with ovals
    var btnOval1 = document.createElement('div');
    var btnOval2 = document.createElement('div');

    // Some variables for setting up right properties for Alan Btn
    var btnSize;
    var sideBtnPos;
    var bottomBtnPos;
    var topBtnPos;
    var initRightPos;
    var btnZIndex;
    var btnIconsZIndex;
    var btnTextPanelsZIndex;
    var btnBgLayerZIndex;

    var popupIsVisible = false;

    //#region Listen online/offline events to manage connected/disconnected states
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    function updateOnlineStatus() {
        if (navigator.onLine) {
            switchState(getDefaultBtnState());
        } else {
            alanAudio.stop();
            switchState(OFFLINE);
        }
    }

    function getDefaultBtnState(state) {
        if (!isOriginSecure()){
            return NOT_SECURE_ORIGIN;
        }
        if (isAudioSupported()) {
            return state || DEFAULT;
        }
        return NO_VOICE_SUPPORT;
    }

    //#endregion

    //#region Define settings based on the btn mode
    // For now we have two modes: small - for tutor, and big for demo
    var btnModes = {
        "tutor": {
            btnSize: 44,
            rightPos: 0,
            leftPos: 0,
            bottomPos: 0,
            topPos: 0,
        },
        "demo": {
            btnSize: options.size || 64,
            rightPos: 20,
            leftPos: 20,
            bottomPos: 40,
            topPos: 0,
        },
        "component": {
            btnSize: options.size || 64,
            rightPos: 20,
            leftPos: 20,
            bottomPos: 40,
            topPos: 0,
        }
    };

    function isTutorMode() {
        return mode.indexOf('tutor') > -1;
    }

    function isPreviewMode() {
        return mode.indexOf('preview') > -1;
    }

    //#endregion

    //#region Set styles for base layers

    btnSize = btnModes[mode].btnSize;

    function setDefautlPositionProps(value) {
        if (/^\d+$/.test(value)) {
            return value + 'px';
        }
        return value;
    }

    function findHighestZIndex() {
        var elements = document.getElementsByTagName("*");
        var defaultZIndex = 4;
        for (var i = 0; i < elements.length; i++) {
            var zindex = Number.parseInt(
                document.defaultView.getComputedStyle(elements[i], null).getPropertyValue("z-index"),
                10
            );
            if (zindex > defaultZIndex) {
                defaultZIndex = zindex;
            }
        }
        return defaultZIndex;
    }

    btnZIndex = options.zIndex || (findHighestZIndex() + 1);
    btnIconsZIndex = btnZIndex - 2;
    btnTextPanelsZIndex = btnZIndex - 1;
    btnBgLayerZIndex = btnZIndex - 3;

    // Define styles for root element

    if (btnZIndex) {
        rootEl.style.zIndex =  btnZIndex;
    }
    
    rootEl.style.position = options.position ? options.position : 'fixed';
    setButtonPosition();

    // Define styles for block with recognised text
    recognisedTextContent.classList.add('alanBtn-recognised-text-content');
    recognisedTextHolder.classList.add('alanBtn-recognised-text-holder');

    setTextPanelPosition(recognisedTextHolder);

    function setButtonPosition(keepBtnPosition) {
        var _savedBtnPosition = keepBtnPosition ? getSavedBtnPosition() : null;

        if (_savedBtnPosition) {
            if (_savedBtnPosition.orientation === 'left') {
                options.left = _savedBtnPosition.x;
                options.top = _savedBtnPosition.y;
            }
            if (_savedBtnPosition.orientation === 'right') {
                options.right = _savedBtnPosition.x;
                options.top = _savedBtnPosition.y;
            }
        }

        if (options.left !== undefined) {
            isLeftAligned = true;
            isRightAligned = false;
        }
        if (options.top !== undefined) {
            isTopAligned = true;
            isBottomAligned = false;
        }

        if (isLeftAligned) {
            sideBtnPos = setDefautlPositionProps(options.left !== undefined ? options.left : btnModes[mode].leftPos);
        } else {
            sideBtnPos = setDefautlPositionProps(options.right !== undefined ? options.right : btnModes[mode].rightPos);
            initRightPos = parseInt(sideBtnPos, 10);
        }

        if (isTopAligned) {
            topBtnPos = setDefautlPositionProps(options.top !== undefined ? options.top : btnModes[mode].topPos);
        } else {
            bottomBtnPos = setDefautlPositionProps(options.bottom !== undefined ? options.bottom : btnModes[mode].bottomPos);
        }

        rootEl.style[isLeftAligned ? 'left' : 'right'] = sideBtnPos;

        if (isTopAligned) {
            rootEl.style.top = topBtnPos;
        } else {
            rootEl.style.bottom = bottomBtnPos;
        }
    }

    function setTextPanelPosition(el, topPos) {
        var _btnSize = parseInt(btnSize, 10);

        if (isLeftAligned) {
            el.style.textAlign = 'left';
            el.style.right = '';
            el.style.left = (absolutePosition ? 0 : parseInt(rootEl.style.left, 10)) + _btnSize + 10 + 'px';
        } else {
            el.style.textAlign = 'right';
            el.style.left = '';
            el.style.right = (absolutePosition ? 0 : parseInt(rootEl.style.right, 10)) + _btnSize + 10 + 'px';
        }

        if (!topPos) {
            if (isTopAligned) {
                el.style.bottom = '';
                el.style.top = (absolutePosition ? 0 : parseInt(rootEl.style.top, 10)) + _btnSize / 2 + 'px';
            } else {
                el.style.top = '';
                el.style.bottom = (absolutePosition ? 0 : parseInt(rootEl.style.bottom, 10)) + _btnSize / 2 + 'px';
            }
        }

        if (absolutePosition) {
            el.style.position = 'absolute';
        }
        if (topPos) {
            el.style.bottom = '';
            el.style.top = (absolutePosition ? 0 : topPos) + _btnSize / 2   + 'px';
            el.style.setProperty('transform', 'translateY(-50%)', 'important');
        }
        el.style.zIndex = btnTextPanelsZIndex;
    }

    function setStylesBasedOnSide() {
        if (isLeftAligned) {
            btn.style.left = 0;
            btn.style.right = '';
            recognisedTextHolder.classList.remove('left-side');
            recognisedTextHolder.classList.add('right-side');
        } else {
            btn.style.right = 0;
            btn.style.left = '';
            recognisedTextHolder.classList.remove('right-side');
            recognisedTextHolder.classList.add('left-side');
        }
    }

    function applyBtnSizeOptions(size) {
        btnSize = size;
        btn.style.width = size + 'px';
        btn.style.minWidth = size + 'px';
        btn.style.maxWidth = size + 'px';
        btn.style.minHeight = size + 'px';
        btn.style.height = size + 'px';
        btn.style.maxHeight = size + 'px';

        rootEl.style.width = size + 'px';
        rootEl.style.minWidth = size + 'px';
        rootEl.style.maxWidth = size + 'px';
        rootEl.style.minHeight = size + 'px';
        rootEl.style.height = size + 'px';
        rootEl.style.maxHeight = size + 'px';

        if (isMobile()) {
            recognisedTextHolder.style.maxWidth = 'calc(100vw - ' + (parseInt(sideBtnPos,10) + parseInt(btnSize,10) + 20) + 'px)';
        }

        applySizeSettingsToBlurLayers([btnOval1, btnOval2]);
    }

    // Define base styles for btn
    btn.style.color = '#fff';
    btn.style.position = 'absolute';
    var transitionCss = 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out';

    applyBtnSizeOptions(btnSize);

    if (isTopAligned) {
        btn.style.top = 0;
    } else {
        btn.style.bottom = 0;
    }
    setStylesBasedOnSide();
    btn.style.borderRadius = '50%';
    // btn.style.boxShadow = '0 8px 10px 0 rgba(0, 75, 144, 0.35)';
    btn.style.textAlign = 'center';
    btn.style.transition = transitionCss;
    btn.style.zIndex = btnZIndex;

    // Specify tabIndex if it exists in options
    if (options && options.tabIndex) {
        btn.tabIndex = options.tabIndex;
    }

    // Specify cursor for btn
    if (isPreviewMode()) {
        btn.style.cursor = 'default';
    } else {
        if(!isMobile()) {
            btn.style.cursor = 'pointer';
        }    
    }

    // Define base styles for microphone btn
    micIconDiv.style.minHeight = '100%';
    micIconDiv.style.height = '100%';
    micIconDiv.style.maxHeight = '100%';
    micIconDiv.style.top = '0%';
    micIconDiv.style.left = '0%';
    micIconDiv.style.zIndex = btnIconsZIndex;
    micIconDiv.style.position = 'relative';
    micIconDiv.style.transition = transitionCss;

    function setUpStylesForAnimatedLogoParts(logos) {
        for (var i = 0; i < logos.length; i++) {
            logos[i].style.minHeight = '100%';
            logos[i].style.height = '100%';
            logos[i].style.maxHeight = '100%';
            logos[i].style.minWidth = '100%';
            logos[i].style.width = '100%';
            logos[i].style.maxWidth = '100%';
            logos[i].style.top = '0%';
            logos[i].style.left = '0%';
            logos[i].style.position = 'absolute';
            logos[i].style.pointerEvents = 'none';
            logos[i].style.animationIterationCount = 'infinite';
            logos[i].style.animationDuration = '9s';
            logos[i].style.animationTimingFunction = 'ease-in-out';
            logos[i].style.opacity = 0;
            logos[i].alt = alanAltText + ' logo animated part ' + i;
            micIconDiv.appendChild(logos[i]);
        }
    }

    logoState1.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1sb2dvLXN0YXRlLTAxPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLWxvZ28tc3RhdGUtMDEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJsb2dvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi4wMDAwMDAsIDIxLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMTkuNjQwMDAxLDEuNDk1NDY4NSBMMjQsOS44NjY2NjY2NyBMMTguMjcxMTkyNCwyMSBMNi40NzczOTQ2NiwyMSBDNS43MDEzMTEwMSwyMS4wMDAxMDYzIDQuOTg5NjE3NzYsMjEuMjk5OTMzOSA0LjYzMDYyNzg1LDIxLjk4OTE5NDUgTDE1LjQ5OTE2NTksMS4xMjE2MDEzOCBDMTUuODQ2MDc4MSwwLjQ1NTUyOTk2NCAxNi41MjIzNTU1LDAuMDI5NDg4MzMzNSAxNy4yNjc4MTEsMC4wMDE0NzIxODExNSBDMTguMjY3Mjc3MSwwLjAzMzk5NDI4OTEgMTkuMTc1MjgxMSwwLjYwMzIwNjQyIDE5LjY0MDAwMSwxLjQ5NTQ2ODUgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTguMjcxMTkyNCwyMSBMMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEMxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTEuOTg1NTIzOSwzMiAxMS4yMDkzMzc4LDMyIEwxLjcwNzg2NDk1LDMyIEMwLjk0MDgwMjc5NiwzMiAwLjMxODk3NjA1OSwzMS4zNzcwOTE4IDAuMzE4OTc2MDU5LDMwLjYwODY5NTcgQzAuMzE4OTc2MDU5LDMwLjM4NDU5NDggMC4zNzMwMTU2MTgsMzAuMTYzODEgMC40NzY0OTcxMDYsMjkuOTY1MTI1NiBMNC42MzA2Mjc4NSwyMS45ODkxOTQ1IEM0Ljk4OTYxNzc2LDIxLjI5OTkzMzkgNS43MDEzMTEwMSwyMS4wMDAxMDYzIDYuNDc3Mzk0NjYsMjEgTDE4LjI3MTE5MjQsMjEgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuMyI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTEuMjA5MzM3OCwzMiBDMTEuOTg1NTIzOSwzMiAxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEwxOC4yNzExOTI0LDIwLjg2NTk3NzMgTDIzLjk1NjQ1ODIsMjAuODY1MTk4MyBDMjQuNzMwOTU2MiwyMC44NjUwOTIyIDI1LjQ0MTU4NjcsMjEuMjk1Mzg0OCAyNS44MDE0ODQ2LDIxLjk4MjM3NjcgTDI5Ljk4MTkwMTUsMjkuOTYyMTc2OSBDMzAuMzM4MzQ0LDMwLjY0MjU3MzIgMzAuMDc2Njg1MiwzMS40ODM1OTk3IDI5LjM5NzQ3MDEsMzEuODQwNjYyMSBDMjkuMTk4MzgzOCwzMS45NDUzMjE1IDI4Ljk3NjkwOTMsMzIgMjguNzUyMDczOCwzMiBMMTEuMjA5MzM3OCwzMiBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC41Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0zMC42NTM3ODIzLC0xLjIzNTcyNjVlLTE0IEMzMC42Nzk5OTUsLTEuMjM1MjQ0MTRlLTE0IDMwLjcwNjEzNDIsMC4wMDA0OTI5NzU2OTEgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzI5LjczMjcyMjksMC4wMzM5OTQyODkxIDI4LjgyNDcxODksMC42MDMyMDY0MiAyOC4zNTk5OTksMS40OTU0Njg1IEwyNCw5Ljg2NjY2NjY3IEwxOS42NDAwMDEsMS40OTU0Njg1IEMxOS4xNjEyODQ2LDAuNTc2MzMzMDYgMTguMjEyMTgsLTEuMjE3ODgzODNlLTE0IDE3LjE3NzI2NTMsLTEuNDIxMDg1NDdlLTE0IEwzMC42NTM3ODIzLC0xLjIzNTcyNjVlLTE0IFogTTI4LjM1OTk5OSwxLjQ5NTQ2ODUgQzI4LjgyNDcxODksMC42MDMyMDY0MiAyOS43MzI3MjI5LDAuMDMzOTk0Mjg5MSAzMC43MzIxODksMC4wMDE0NzIxODExNSBDMzAuNzA2MTM0MiwwLjAwMDQ5Mjk3NTY5MSAzMC42Nzk5OTUsLTEuMjM1MjQ0MTRlLTE0IDMwLjY1Mzc4MjMsLTEuMjM1NzI2NWUtMTQgTDMwLjk0NDQ0NDQsLTEuNDIxMDg1NDdlLTE0IEwzMC44MjI3MzQ3LC0xLjIzNzUxMTgzZS0xNCBDMzAuNzkyNDc2MywtMS4yMzE1ODY5M2UtMTQgMzAuNzYyMjkxMSwwLjAwMDQ5MjY3MjYzNSAzMC43MzIxODksMC4wMDE0NzIxODExNSBDMzEuNDc3NjQ0NSwwLjAyOTQ4ODMzMzUgMzIuMTUzOTIxOSwwLjQ1NTUyOTk2NCAzMi41MDA4MzQxLDEuMTIxNjAxMzggTDQ3LjUyMzUwMjksMjkuOTY1MTI1NiBDNDcuNjI2OTg0NCwzMC4xNjM4MSA0Ny42ODEwMjM5LDMwLjM4NDU5NDggNDcuNjgxMDIzOSwzMC42MDg2OTU3IEM0Ny42ODEwMjM5LDMxLjM3NzA5MTggNDcuMDU5MTk3MiwzMiA0Ni4yOTIxMzUxLDMyIEwzNi43OTA2NjIyLDMyIEMzNi4wMTQ0NzYxLDMyIDM1LjMwMjY0NzcsMzEuNTY3NzUwMiAzNC45NDM2MTA0LDMwLjg3ODM5ODYgTDI0LDkuODY2NjY2NjcgTDI4LjM1OTk5OSwxLjQ5NTQ2ODUgWiIgaWQ9InNoYXBlLTIiIGZpbGwtb3BhY2l0eT0iMC45Ij48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=";
    logoState2.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1sb2dvLXN0YXRlLTAyPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLWxvZ28tc3RhdGUtMDIiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJsb2dvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi4wMDAwMDAsIDIxLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMTguMjcxMTkyNCwyMSBMMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEMxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTEuOTg1NTIzOSwzMiAxMS4yMDkzMzc4LDMyIEwxLjcwNzg2NDk1LDMyIEMwLjk0MDgwMjc5NiwzMiAwLjMxODk3NjA1OSwzMS4zNzcwOTE4IDAuMzE4OTc2MDU5LDMwLjYwODY5NTcgQzAuMzE4OTc2MDU5LDMwLjM4NDU5NDggMC4zNzMwMTU2MTgsMzAuMTYzODEgMC40NzY0OTcxMDYsMjkuOTY1MTI1NiBMNC42MzA2Mjc4NSwyMS45ODkxOTQ1IEwxNS40OTkxNjU5LDEuMTIxNjAxMzggQzE1Ljg0NjA3ODEsMC40NTU1Mjk5NjQgMTYuNTIyMzU1NSwwLjAyOTQ4ODMzMzUgMTcuMjY3ODExLDAuMDAxNDcyMTgxMTUgQzE4LjI2NzI3NzEsMC4wMzM5OTQyODkxIDE5LjE3NTI4MTEsMC42MDMyMDY0MiAxOS42NDAwMDEsMS40OTU0Njg1IEwyNCw5Ljg2NjY2NjY3IEwxOC4yNzExOTI0LDIxIFoiIGlkPSJzaGFwZS0yIiBmaWxsLW9wYWNpdHk9IjAuMyI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTEuMjA5MzM3OCwzMiBDMTEuOTg1NTIzOSwzMiAxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEwxOC4yNzExOTI0LDIwLjg2NTk3NzMgTDIzLjk1NjQ1ODIsMjAuODY1MTk4MyBDMjQuNzMwOTU2MiwyMC44NjUwOTIyIDI1LjQ0MTU4NjcsMjEuMjk1Mzg0OCAyNS44MDE0ODQ2LDIxLjk4MjM3NjcgTDI5Ljk4MTkwMTUsMjkuOTYyMTc2OSBDMzAuMzM4MzQ0LDMwLjY0MjU3MzIgMzAuMDc2Njg1MiwzMS40ODM1OTk3IDI5LjM5NzQ3MDEsMzEuODQwNjYyMSBDMjkuMTk4MzgzOCwzMS45NDUzMjE1IDI4Ljk3NjkwOTMsMzIgMjguNzUyMDczOCwzMiBMMTEuMjA5MzM3OCwzMiBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC41Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yOC4zNTk5OTksMS40OTU0Njg1IEMyOC44MjQ3MTg5LDAuNjAzMjA2NDIgMjkuNzMyNzIyOSwwLjAzMzk5NDI4OTEgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzMwLjcwNjEzNDIsMC4wMDA0OTI5NzU2OTEgMzAuNjc5OTk1LDEuODU4NDEzMzFlLTE1IDMwLjY1Mzc4MjMsMS44NTM1ODk3NWUtMTUgTDMwLjk0NDQ0NDQsMCBMMzAuODIyNzM0NywxLjgzNTczNjRlLTE1IEMzMC43OTI0NzYzLDEuODk0OTg1MzllLTE1IDMwLjc2MjI5MTEsMC4wMDA0OTI2NzI2MzUgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzMxLjQ3NzY0NDUsMC4wMjk0ODgzMzM1IDMyLjE1MzkyMTksMC40NTU1Mjk5NjQgMzIuNTAwODM0MSwxLjEyMTYwMTM4IEw0Ny41MjM1MDI5LDI5Ljk2NTEyNTYgQzQ3LjYyNjk4NDQsMzAuMTYzODEgNDcuNjgxMDIzOSwzMC4zODQ1OTQ4IDQ3LjY4MTAyMzksMzAuNjA4Njk1NyBDNDcuNjgxMDIzOSwzMS4zNzcwOTE4IDQ3LjA1OTE5NzIsMzIgNDYuMjkyMTM1MSwzMiBMMzYuNzkwNjYyMiwzMiBDMzYuMDE0NDc2MSwzMiAzNS4zMDI2NDc3LDMxLjU2Nzc1MDIgMzQuOTQzNjEwNCwzMC44NzgzOTg2IEwyNCw5Ljg2NjY2NjY3IEwyOC4zNTk5OTksMS40OTU0Njg1IFoiIGlkPSJzaGFwZSIgZmlsbC1vcGFjaXR5PSIwLjkiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTMwLjY1Mzc4MjMsMS44NTM1ODk3NWUtMTUgQzMwLjY3OTk5NSwxLjg1ODQxMzMxZS0xNSAzMC43MDYxMzQyLDAuMDAwNDkyOTc1NjkxIDMwLjczMjE4OSwwLjAwMTQ3MjE4MTE1IEMyOS43MzI3MjI5LDAuMDMzOTk0Mjg5MSAyOC44MjQ3MTg5LDAuNjAzMjA2NDIgMjguMzU5OTk5LDEuNDk1NDY4NSBMMjQsOS44NjY2NjY2NyBMMTkuNjQwMDAxLDEuNDk1NDY4NSBDMTkuMTYxMjg0NiwwLjU3NjMzMzA2IDE4LjIxMjE4LDIuMDMyMDE2NDNlLTE1IDE3LjE3NzI2NTMsMCBMMzAuNjUzNzgyMywxLjg1MzU4OTc1ZS0xNSBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC41Ij48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=";
    logoState3.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1sb2dvLXN0YXRlLTAzPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLWxvZ28tc3RhdGUtMDMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJsb2dvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi4wMDAwMDAsIDIxLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMTkuNjQwMDAxLDEuNDk1NDY4NSBMMjQsOS44NjY2NjY2NyBMMTguMjcxMTkyNCwyMSBMNi40NzczOTQ2NiwyMSBDNS43MDEzMTEwMSwyMS4wMDAxMDYzIDQuOTg5NjE3NzYsMjEuMjk5OTMzOSA0LjYzMDYyNzg1LDIxLjk4OTE5NDUgTDE1LjQ5OTE2NTksMS4xMjE2MDEzOCBDMTUuODQ2MDc4MSwwLjQ1NTUyOTk2NCAxNi41MjIzNTU1LDAuMDI5NDg4MzMzNSAxNy4yNjc4MTEsMC4wMDE0NzIxODExNSBDMTguMjY3Mjc3MSwwLjAzMzk5NDI4OTEgMTkuMTc1MjgxMSwwLjYwMzIwNjQyIDE5LjY0MDAwMSwxLjQ5NTQ2ODUgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuMyI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTguMjcxMTkyNCwyMSBMMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEMxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTEuOTg1NTIzOSwzMiAxMS4yMDkzMzc4LDMyIEwxLjcwNzg2NDk1LDMyIEMwLjk0MDgwMjc5NiwzMiAwLjMxODk3NjA1OSwzMS4zNzcwOTE4IDAuMzE4OTc2MDU5LDMwLjYwODY5NTcgQzAuMzE4OTc2MDU5LDMwLjM4NDU5NDggMC4zNzMwMTU2MTgsMzAuMTYzODEgMC40NzY0OTcxMDYsMjkuOTY1MTI1NiBMNC42MzA2Mjc4NSwyMS45ODkxOTQ1IEM0Ljk4OTYxNzc2LDIxLjI5OTkzMzkgNS43MDEzMTEwMSwyMS4wMDAxMDYzIDYuNDc3Mzk0NjYsMjEgTDE4LjI3MTE5MjQsMjEgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTEuMjA5MzM3OCwzMiBDMTEuOTg1NTIzOSwzMiAxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEwxOC4yNzExOTI0LDIwLjg2NTk3NzMgTDIzLjk1NjQ1ODIsMjAuODY1MTk4MyBDMjQuNzMwOTU2MiwyMC44NjUwOTIyIDI1LjQ0MTU4NjcsMjEuMjk1Mzg0OCAyNS44MDE0ODQ2LDIxLjk4MjM3NjcgTDI5Ljk4MTkwMTUsMjkuOTYyMTc2OSBDMzAuMzM4MzQ0LDMwLjY0MjU3MzIgMzAuMDc2Njg1MiwzMS40ODM1OTk3IDI5LjM5NzQ3MDEsMzEuODQwNjYyMSBDMjkuMTk4MzgzOCwzMS45NDUzMjE1IDI4Ljk3NjkwOTMsMzIgMjguNzUyMDczOCwzMiBMMTEuMjA5MzM3OCwzMiBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC45Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yOC4zNTk5OTksMS40OTU0Njg1IEMyOC44MjQ3MTg5LDAuNjAzMjA2NDIgMjkuNzMyNzIyOSwwLjAzMzk5NDI4OTEgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzMwLjcwNjEzNDIsMC4wMDA0OTI5NzU2OTEgMzAuNjc5OTk1LC0xLjIzNTI0NDE0ZS0xNCAzMC42NTM3ODIzLC0xLjIzNTcyNjVlLTE0IEwzMC45NDQ0NDQ0LC0xLjQyMTA4NTQ3ZS0xNCBMMzAuODIyNzM0NywtMS4yMzc1MTE4M2UtMTQgQzMwLjc5MjQ3NjMsLTEuMjMxNTg2OTNlLTE0IDMwLjc2MjI5MTEsMC4wMDA0OTI2NzI2MzUgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzMxLjQ3NzY0NDUsMC4wMjk0ODgzMzM1IDMyLjE1MzkyMTksMC40NTU1Mjk5NjQgMzIuNTAwODM0MSwxLjEyMTYwMTM4IEw0Ny41MjM1MDI5LDI5Ljk2NTEyNTYgQzQ3LjYyNjk4NDQsMzAuMTYzODEgNDcuNjgxMDIzOSwzMC4zODQ1OTQ4IDQ3LjY4MTAyMzksMzAuNjA4Njk1NyBDNDcuNjgxMDIzOSwzMS4zNzcwOTE4IDQ3LjA1OTE5NzIsMzIgNDYuMjkyMTM1MSwzMiBMMzYuNzkwNjYyMiwzMiBDMzYuMDE0NDc2MSwzMiAzNS4zMDI2NDc3LDMxLjU2Nzc1MDIgMzQuOTQzNjEwNCwzMC44NzgzOTg2IEwyNCw5Ljg2NjY2NjY3IEwyOC4zNTk5OTksMS40OTU0Njg1IFoiIGlkPSJzaGFwZSIgZmlsbC1vcGFjaXR5PSIwLjkiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTMwLjY1Mzc4MjMsLTEuMjM1NzI2NWUtMTQgQzMwLjY3OTk5NSwtMS4yMzUyNDQxNGUtMTQgMzAuNzA2MTM0MiwwLjAwMDQ5Mjk3NTY5MSAzMC43MzIxODksMC4wMDE0NzIxODExNSBDMjkuNzMyNzIyOSwwLjAzMzk5NDI4OTEgMjguODI0NzE4OSwwLjYwMzIwNjQyIDI4LjM1OTk5OSwxLjQ5NTQ2ODUgTDI0LDkuODY2NjY2NjcgTDE5LjY0MDAwMSwxLjQ5NTQ2ODUgQzE5LjE2MTI4NDYsMC41NzYzMzMwNiAxOC4yMTIxOCwtMS4yMTc4ODM4M2UtMTQgMTcuMTc3MjY1MywtMS40MjEwODU0N2UtMTQgTDMwLjY1Mzc4MjMsLTEuMjM1NzI2NWUtMTQgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+";
    logoState4.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1sb2dvLXN0YXRlLTA0PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLWxvZ28tc3RhdGUtMDQiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJsb2dvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi4wMDAwMDAsIDIxLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMjQsOS44NjY2NjY2NyBMMTguMjcxMTkyNCwyMSBMNi40NzczOTQ2NiwyMSBDNS43MDEzMTEwMSwyMS4wMDAxMDYzIDQuOTg5NjE3NzYsMjEuMjk5OTMzOSA0LjYzMDYyNzg1LDIxLjk4OTE5NDUgTDE1LjQ5OTE2NTksMS4xMjE2MDEzOCBDMTUuODQ2MDc4MSwwLjQ1NTUyOTk2NCAxNi41MjIzNTU1LDAuMDI5NDg4MzMzNSAxNy4yNjc4MTEsMC4wMDE0NzIxODExNSBDMTcuMjM3NzA4OSwwLjAwMDQ5MjY3MjYzNSAxNy4yMDc1MjM3LDEuOTU5OTMzNjZlLTE0IDE3LjE3NzI2NTMsMS45NTM5OTI1MmUtMTQgTDMwLjY1Mzc4MjMsMi4xMzkzNTE1ZS0xNCBDMzAuNjc5OTk1LDIuMTM5ODMzODVlLTE0IDMwLjcwNjEzNDIsMC4wMDA0OTI5NzU2OTEgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzI5LjczMjcyMjksMC4wMzM5OTQyODkxIDI4LjgyNDcxODksMC42MDMyMDY0MiAyOC4zNTk5OTksMS40OTU0Njg1IEwyNCw5Ljg2NjY2NjY3IFoiIGlkPSJzaGFwZS0yIiBmaWxsLW9wYWNpdHk9IjAuMyI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTguMjcxMTkyNCwyMSBMMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEMxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTEuOTg1NTIzOSwzMiAxMS4yMDkzMzc4LDMyIEwxLjcwNzg2NDk1LDMyIEMwLjk0MDgwMjc5NiwzMiAwLjMxODk3NjA1OSwzMS4zNzcwOTE4IDAuMzE4OTc2MDU5LDMwLjYwODY5NTcgQzAuMzE4OTc2MDU5LDMwLjM4NDU5NDggMC4zNzMwMTU2MTgsMzAuMTYzODEgMC40NzY0OTcxMDYsMjkuOTY1MTI1NiBMNC42MzA2Mjc4NSwyMS45ODkxOTQ1IEM0Ljk4OTYxNzc2LDIxLjI5OTkzMzkgNS43MDEzMTEwMSwyMS4wMDAxMDYzIDYuNDc3Mzk0NjYsMjEgTDE4LjI3MTE5MjQsMjEgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTEuMjA5MzM3OCwzMiBDMTEuOTg1NTIzOSwzMiAxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEwxOC4yNzExOTI0LDIwLjg2NTk3NzMgTDIzLjk1NjQ1ODIsMjAuODY1MTk4MyBDMjQuNzMwOTU2MiwyMC44NjUwOTIyIDI1LjQ0MTU4NjcsMjEuMjk1Mzg0OCAyNS44MDE0ODQ2LDIxLjk4MjM3NjcgTDI5Ljk4MTkwMTUsMjkuOTYyMTc2OSBDMzAuMzM4MzQ0LDMwLjY0MjU3MzIgMzAuMDc2Njg1MiwzMS40ODM1OTk3IDI5LjM5NzQ3MDEsMzEuODQwNjYyMSBDMjkuMTk4MzgzOCwzMS45NDUzMjE1IDI4Ljk3NjkwOTMsMzIgMjguNzUyMDczOCwzMiBMMTEuMjA5MzM3OCwzMiBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC45Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yOC4zNTk5OTksMS40OTU0Njg1IEMyOC44MjQ3MTg5LDAuNjAzMjA2NDIgMjkuNzMyNzIyOSwwLjAzMzk5NDI4OTEgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzMwLjcwNjEzNDIsMC4wMDA0OTI5NzU2OTEgMzAuNjc5OTk1LC0xLjIzNTI0NDE0ZS0xNCAzMC42NTM3ODIzLC0xLjIzNTcyNjVlLTE0IEwzMC45NDQ0NDQ0LC0xLjQyMTA4NTQ3ZS0xNCBMMzAuODIyNzM0NywtMS4yMzc1MTE4M2UtMTQgQzMwLjc5MjQ3NjMsLTEuMjMxNTg2OTNlLTE0IDMwLjc2MjI5MTEsMC4wMDA0OTI2NzI2MzUgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzMxLjQ3NzY0NDUsMC4wMjk0ODgzMzM1IDMyLjE1MzkyMTksMC40NTU1Mjk5NjQgMzIuNTAwODM0MSwxLjEyMTYwMTM4IEw0Ny41MjM1MDI5LDI5Ljk2NTEyNTYgQzQ3LjYyNjk4NDQsMzAuMTYzODEgNDcuNjgxMDIzOSwzMC4zODQ1OTQ4IDQ3LjY4MTAyMzksMzAuNjA4Njk1NyBDNDcuNjgxMDIzOSwzMS4zNzcwOTE4IDQ3LjA1OTE5NzIsMzIgNDYuMjkyMTM1MSwzMiBMMzYuNzkwNjYyMiwzMiBDMzYuMDE0NDc2MSwzMiAzNS4zMDI2NDc3LDMxLjU2Nzc1MDIgMzQuOTQzNjEwNCwzMC44NzgzOTg2IEwyNCw5Ljg2NjY2NjY3IEwyOC4zNTk5OTksMS40OTU0Njg1IFoiIGlkPSJzaGFwZSIgZmlsbC1vcGFjaXR5PSIwLjUiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==";
    logoState5.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1sb2dvLXN0YXRlLTA1PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLWxvZ28tc3RhdGUtMDUiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJsb2dvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi4wMDAwMDAsIDIxLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMTkuNjQwMDAxLDEuNDk1NDY4NSBMMjQsOS44NjY2NjY2NyBMMTguMjcxMTkyNCwyMSBMNi40NzczOTQ2NiwyMSBDNS43MDEzMTEwMSwyMS4wMDAxMDYzIDQuOTg5NjE3NzYsMjEuMjk5OTMzOSA0LjYzMDYyNzg1LDIxLjk4OTE5NDUgTDE1LjQ5OTE2NTksMS4xMjE2MDEzOCBDMTUuODQ2MDc4MSwwLjQ1NTUyOTk2NCAxNi41MjIzNTU1LDAuMDI5NDg4MzMzNSAxNy4yNjc4MTEsMC4wMDE0NzIxODExNSBDMTguMjY3Mjc3MSwwLjAzMzk5NDI4OTEgMTkuMTc1MjgxMSwwLjYwMzIwNjQyIDE5LjY0MDAwMSwxLjQ5NTQ2ODUgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMjguMzU5OTk5LDEuNDk1NDY4NSBDMjguODI0NzE4OSwwLjYwMzIwNjQyIDI5LjczMjcyMjksMC4wMzM5OTQyODkxIDMwLjczMjE4OSwwLjAwMTQ3MjE4MTE1IEMzMC43MDYxMzQyLDAuMDAwNDkyOTc1NjkxIDMwLjY3OTk5NSwtMS4yMzUyNDQxNGUtMTQgMzAuNjUzNzgyMywtMS4yMzU3MjY1ZS0xNCBMMzAuOTQ0NDQ0NCwtMS40MjEwODU0N2UtMTQgTDMwLjgyMjczNDcsLTEuMjM3NTExODNlLTE0IEMzMC43OTI0NzYzLC0xLjIzMTU4NjkzZS0xNCAzMC43NjIyOTExLDAuMDAwNDkyNjcyNjM1IDMwLjczMjE4OSwwLjAwMTQ3MjE4MTE1IEMzMS40Nzc2NDQ1LDAuMDI5NDg4MzMzNSAzMi4xNTM5MjE5LDAuNDU1NTI5OTY0IDMyLjUwMDgzNDEsMS4xMjE2MDEzOCBMNDcuNTIzNTAyOSwyOS45NjUxMjU2IEM0Ny42MjY5ODQ0LDMwLjE2MzgxIDQ3LjY4MTAyMzksMzAuMzg0NTk0OCA0Ny42ODEwMjM5LDMwLjYwODY5NTcgQzQ3LjY4MTAyMzksMzEuMzc3MDkxOCA0Ny4wNTkxOTcyLDMyIDQ2LjI5MjEzNTEsMzIgTDM2Ljc5MDY2MjIsMzIgQzM2LjAxNDQ3NjEsMzIgMzUuMzAyNjQ3NywzMS41Njc3NTAyIDM0Ljk0MzYxMDQsMzAuODc4Mzk4NiBMMjQsOS44NjY2NjY2NyBMMjguMzU5OTk5LDEuNDk1NDY4NSBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC41Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0zMC42NTM3ODIzLC0xLjIzNTcyNjVlLTE0IEMzMC42Nzk5OTUsLTEuMjM1MjQ0MTRlLTE0IDMwLjcwNjEzNDIsMC4wMDA0OTI5NzU2OTEgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzI5LjczMjcyMjksMC4wMzM5OTQyODkxIDI4LjgyNDcxODksMC42MDMyMDY0MiAyOC4zNTk5OTksMS40OTU0Njg1IEwyNCw5Ljg2NjY2NjY3IEwxOS42NDAwMDEsMS40OTU0Njg1IEMxOS4xNjEyODQ2LDAuNTc2MzMzMDYgMTguMjEyMTgsLTEuMjE3ODgzODNlLTE0IDE3LjE3NzI2NTMsLTEuNDIxMDg1NDdlLTE0IEwzMC42NTM3ODIzLC0xLjIzNTcyNjVlLTE0IFoiIGlkPSJzaGFwZSIgZmlsbC1vcGFjaXR5PSIwLjMiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTE4LjI3MTE5MjQsMjEgTDIzLjk1NjQ1ODIsMjEgQzI0LjczMDk1NjIsMjAuOTk5ODkzOSAyNS40NDE1ODY3LDIxLjI5NTM4NDggMjUuODAxNDg0NiwyMS45ODIzNzY3IEwyOS45ODE5MDE1LDI5Ljk2MjE3NjkgQzMwLjMzODM0NCwzMC42NDI1NzMyIDMwLjA3NjY4NTIsMzEuNDgzNTk5NyAyOS4zOTc0NzAxLDMxLjg0MDY2MjEgQzI5LjE5ODM4MzgsMzEuOTQ1MzIxNSAyOC45NzY5MDkzLDMyIDI4Ljc1MjA3MzgsMzIgTDExLjIwOTMzNzgsMzIgTDEuNzA3ODY0OTUsMzIgQzAuOTQwODAyNzk2LDMyIDAuMzE4OTc2MDU5LDMxLjM3NzA5MTggMC4zMTg5NzYwNTksMzAuNjA4Njk1NyBDMC4zMTg5NzYwNTksMzAuMzg0NTk0OCAwLjM3MzAxNTYxOCwzMC4xNjM4MSAwLjQ3NjQ5NzEwNiwyOS45NjUxMjU2IEw0LjYzMDYyNzg1LDIxLjk4OTE5NDUgQzQuOTg5NjE3NzYsMjEuMjk5OTMzOSA1LjcwMTMxMTAxLDIxLjAwMDEwNjMgNi40NzczOTQ2NiwyMSBMMTguMjcxMTkyNCwyMSBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC45Ij48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=";
    logoState6.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1sb2dvLXN0YXRlLTA2PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLWxvZ28tc3RhdGUtMDYiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJsb2dvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi4wMDAwMDAsIDIxLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMTkuNjQwMDAxLDEuNDk1NDY4NSBMMjQsOS44NjY2NjY2NyBMMTguMjcxMTkyNCwyMSBMNi40NzczOTQ2NiwyMSBDNS43MDEzMTEwMSwyMS4wMDAxMDYzIDQuOTg5NjE3NzYsMjEuMjk5OTMzOSA0LjYzMDYyNzg1LDIxLjk4OTE5NDUgTDE1LjQ5OTE2NTksMS4xMjE2MDEzOCBDMTUuODQ2MDc4MSwwLjQ1NTUyOTk2NCAxNi41MjIzNTU1LDAuMDI5NDg4MzMzNSAxNy4yNjc4MTEsMC4wMDE0NzIxODExNSBDMTguMjY3Mjc3MSwwLjAzMzk5NDI4OTEgMTkuMTc1MjgxMSwwLjYwMzIwNjQyIDE5LjY0MDAwMSwxLjQ5NTQ2ODUgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMzAuNjUzNzgyMywxLjg1MzU4OTc1ZS0xNSBMMzAuOTQ0NDQ0NCwwIEwzMC44MjI3MzQ3LDEuODM1NzM2NGUtMTUgQzMwLjc5MjQ3NjMsMS44OTQ5ODUzOWUtMTUgMzAuNzYyMjkxMSwwLjAwMDQ5MjY3MjYzNSAzMC43MzIxODksMC4wMDE0NzIxODExNSBDMzEuNDc3NjQ0NSwwLjAyOTQ4ODMzMzUgMzIuMTUzOTIxOSwwLjQ1NTUyOTk2NCAzMi41MDA4MzQxLDEuMTIxNjAxMzggTDQ3LjUyMzUwMjksMjkuOTY1MTI1NiBDNDcuNjI2OTg0NCwzMC4xNjM4MSA0Ny42ODEwMjM5LDMwLjM4NDU5NDggNDcuNjgxMDIzOSwzMC42MDg2OTU3IEM0Ny42ODEwMjM5LDMxLjM3NzA5MTggNDcuMDU5MTk3MiwzMiA0Ni4yOTIxMzUxLDMyIEwzNi43OTA2NjIyLDMyIEMzNi4wMTQ0NzYxLDMyIDM1LjMwMjY0NzcsMzEuNTY3NzUwMiAzNC45NDM2MTA0LDMwLjg3ODM5ODYgTDI0LDkuODY2NjY2NjcgTDE5LjY0MDAwMSwxLjQ5NTQ2ODUgQzE5LjE2MTI4NDYsMC41NzYzMzMwNiAxOC4yMTIxOCwyLjAzMjAxNjQzZS0xNSAxNy4xNzcyNjUzLDAgTDMwLjY1Mzc4MjMsMS44NTM1ODk3NWUtMTUgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuMyI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTguMjcxMTkyNCwyMSBMMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEMxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTEuOTg1NTIzOSwzMiAxMS4yMDkzMzc4LDMyIEwxLjcwNzg2NDk1LDMyIEMwLjk0MDgwMjc5NiwzMiAwLjMxODk3NjA1OSwzMS4zNzcwOTE4IDAuMzE4OTc2MDU5LDMwLjYwODY5NTcgQzAuMzE4OTc2MDU5LDMwLjM4NDU5NDggMC4zNzMwMTU2MTgsMzAuMTYzODEgMC40NzY0OTcxMDYsMjkuOTY1MTI1NiBMNC42MzA2Mjc4NSwyMS45ODkxOTQ1IEM0Ljk4OTYxNzc2LDIxLjI5OTkzMzkgNS43MDEzMTEwMSwyMS4wMDAxMDYzIDYuNDc3Mzk0NjYsMjEgTDE4LjI3MTE5MjQsMjEgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuOSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTEuMjA5MzM3OCwzMiBDMTEuOTg1NTIzOSwzMiAxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEwxOC4yNzExOTI0LDIwLjg2NTk3NzMgTDIzLjk1NjQ1ODIsMjAuODY1MTk4MyBDMjQuNzMwOTU2MiwyMC44NjUwOTIyIDI1LjQ0MTU4NjcsMjEuMjk1Mzg0OCAyNS44MDE0ODQ2LDIxLjk4MjM3NjcgTDI5Ljk4MTkwMTUsMjkuOTYyMTc2OSBDMzAuMzM4MzQ0LDMwLjY0MjU3MzIgMzAuMDc2Njg1MiwzMS40ODM1OTk3IDI5LjM5NzQ3MDEsMzEuODQwNjYyMSBDMjkuMTk4MzgzOCwzMS45NDUzMjE1IDI4Ljk3NjkwOTMsMzIgMjguNzUyMDczOCwzMiBMMTEuMjA5MzM3OCwzMiBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC41Ij48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=";
    logoState7.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1sb2dvLXN0YXRlLTA3PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLWxvZ28tc3RhdGUtMDciIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJsb2dvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi4wMDAwMDAsIDIxLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMTguMjcxMTkyNCwyMSBMMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEMxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTEuOTg1NTIzOSwzMiAxMS4yMDkzMzc4LDMyIEwxLjcwNzg2NDk1LDMyIEMwLjk0MDgwMjc5NiwzMiAwLjMxODk3NjA1OSwzMS4zNzcwOTE4IDAuMzE4OTc2MDU5LDMwLjYwODY5NTcgQzAuMzE4OTc2MDU5LDMwLjM4NDU5NDggMC4zNzMwMTU2MTgsMzAuMTYzODEgMC40NzY0OTcxMDYsMjkuOTY1MTI1NiBMNC42MzA2Mjc4NSwyMS45ODkxOTQ1IEwxNS40OTkxNjU5LDEuMTIxNjAxMzggQzE1Ljg0NjA3ODEsMC40NTU1Mjk5NjQgMTYuNTIyMzU1NSwwLjAyOTQ4ODMzMzUgMTcuMjY3ODExLDAuMDAxNDcyMTgxMTUgQzE4LjI2NzI3NzEsMC4wMzM5OTQyODkxIDE5LjE3NTI4MTEsMC42MDMyMDY0MiAxOS42NDAwMDEsMS40OTU0Njg1IEwyNCw5Ljg2NjY2NjY3IEwxOC4yNzExOTI0LDIxIFoiIGlkPSJzaGFwZS0yIiBmaWxsLW9wYWNpdHk9IjAuOSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMjguMzU5OTk5LDEuNDk1NDY4NSBDMjguODI0NzE4OSwwLjYwMzIwNjQyIDI5LjczMjcyMjksMC4wMzM5OTQyODkxIDMwLjczMjE4OSwwLjAwMTQ3MjE4MTE1IEMzMC43MDYxMzQyLDAuMDAwNDkyOTc1NjkxIDMwLjY3OTk5NSwxLjg1ODQxMzMxZS0xNSAzMC42NTM3ODIzLDEuODUzNTg5NzVlLTE1IEwzMC45NDQ0NDQ0LDAgTDMwLjgyMjczNDcsMS44MzU3MzY0ZS0xNSBDMzAuNzkyNDc2MywxLjg5NDk4NTM5ZS0xNSAzMC43NjIyOTExLDAuMDAwNDkyNjcyNjM1IDMwLjczMjE4OSwwLjAwMTQ3MjE4MTE1IEMzMS40Nzc2NDQ1LDAuMDI5NDg4MzMzNSAzMi4xNTM5MjE5LDAuNDU1NTI5OTY0IDMyLjUwMDgzNDEsMS4xMjE2MDEzOCBMNDcuNTIzNTAyOSwyOS45NjUxMjU2IEM0Ny42MjY5ODQ0LDMwLjE2MzgxIDQ3LjY4MTAyMzksMzAuMzg0NTk0OCA0Ny42ODEwMjM5LDMwLjYwODY5NTcgQzQ3LjY4MTAyMzksMzEuMzc3MDkxOCA0Ny4wNTkxOTcyLDMyIDQ2LjI5MjEzNTEsMzIgTDM2Ljc5MDY2MjIsMzIgQzM2LjAxNDQ3NjEsMzIgMzUuMzAyNjQ3NywzMS41Njc3NTAyIDM0Ljk0MzYxMDQsMzAuODc4Mzk4NiBMMjQsOS44NjY2NjY2NyBMMjguMzU5OTk5LDEuNDk1NDY4NSBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC4zIj48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0zMC42NTM3ODIzLDEuODUzNTg5NzVlLTE1IEMzMC42Nzk5OTUsMS44NTg0MTMzMWUtMTUgMzAuNzA2MTM0MiwwLjAwMDQ5Mjk3NTY5MSAzMC43MzIxODksMC4wMDE0NzIxODExNSBDMjkuNzMyNzIyOSwwLjAzMzk5NDI4OTEgMjguODI0NzE4OSwwLjYwMzIwNjQyIDI4LjM1OTk5OSwxLjQ5NTQ2ODUgTDI0LDkuODY2NjY2NjcgTDE5LjY0MDAwMSwxLjQ5NTQ2ODUgQzE5LjE2MTI4NDYsMC41NzYzMzMwNiAxOC4yMTIxOCwyLjAzMjAxNjQzZS0xNSAxNy4xNzcyNjUzLDAgTDMwLjY1Mzc4MjMsMS44NTM1ODk3NWUtMTUgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTEuMjA5MzM3OCwzMiBDMTEuOTg1NTIzOSwzMiAxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEwxOC4yNzExOTI0LDIwLjg2NTk3NzMgTDIzLjk1NjQ1ODIsMjAuODY1MTk4MyBDMjQuNzMwOTU2MiwyMC44NjUwOTIyIDI1LjQ0MTU4NjcsMjEuMjk1Mzg0OCAyNS44MDE0ODQ2LDIxLjk4MjM3NjcgTDI5Ljk4MTkwMTUsMjkuOTYyMTc2OSBDMzAuMzM4MzQ0LDMwLjY0MjU3MzIgMzAuMDc2Njg1MiwzMS40ODM1OTk3IDI5LjM5NzQ3MDEsMzEuODQwNjYyMSBDMjkuMTk4MzgzOCwzMS45NDUzMjE1IDI4Ljk3NjkwOTMsMzIgMjguNzUyMDczOCwzMiBMMTEuMjA5MzM3OCwzMiBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC41Ij48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=";
    logoState8.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1sb2dvLXN0YXRlLTA4PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLWxvZ28tc3RhdGUtMDgiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJsb2dvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi4wMDAwMDAsIDIxLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMTkuNjQwMDAxLDEuNDk1NDY4NSBMMjQsOS44NjY2NjY2NyBMMTguMjcxMTkyNCwyMSBMNi40NzczOTQ2NiwyMSBDNS43MDEzMTEwMSwyMS4wMDAxMDYzIDQuOTg5NjE3NzYsMjEuMjk5OTMzOSA0LjYzMDYyNzg1LDIxLjk4OTE5NDUgTDE1LjQ5OTE2NTksMS4xMjE2MDEzOCBDMTUuODQ2MDc4MSwwLjQ1NTUyOTk2NCAxNi41MjIzNTU1LDAuMDI5NDg4MzMzNSAxNy4yNjc4MTEsMC4wMDE0NzIxODExNSBDMTguMjY3Mjc3MSwwLjAzMzk5NDI4OTEgMTkuMTc1MjgxMSwwLjYwMzIwNjQyIDE5LjY0MDAwMSwxLjQ5NTQ2ODUgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuOSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTguMjcxMTkyNCwyMSBMMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEMxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTEuOTg1NTIzOSwzMiAxMS4yMDkzMzc4LDMyIEwxLjcwNzg2NDk1LDMyIEMwLjk0MDgwMjc5NiwzMiAwLjMxODk3NjA1OSwzMS4zNzcwOTE4IDAuMzE4OTc2MDU5LDMwLjYwODY5NTcgQzAuMzE4OTc2MDU5LDMwLjM4NDU5NDggMC4zNzMwMTU2MTgsMzAuMTYzODEgMC40NzY0OTcxMDYsMjkuOTY1MTI1NiBMNC42MzA2Mjc4NSwyMS45ODkxOTQ1IEM0Ljk4OTYxNzc2LDIxLjI5OTkzMzkgNS43MDEzMTEwMSwyMS4wMDAxMDYzIDYuNDc3Mzk0NjYsMjEgTDE4LjI3MTE5MjQsMjEgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTEuMjA5MzM3OCwzMiBDMTEuOTg1NTIzOSwzMiAxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEwxOC4yNzExOTI0LDIwLjg2NTk3NzMgTDIzLjk1NjQ1ODIsMjAuODY1MTk4MyBDMjQuNzMwOTU2MiwyMC44NjUwOTIyIDI1LjQ0MTU4NjcsMjEuMjk1Mzg0OCAyNS44MDE0ODQ2LDIxLjk4MjM3NjcgTDI5Ljk4MTkwMTUsMjkuOTYyMTc2OSBDMzAuMzM4MzQ0LDMwLjY0MjU3MzIgMzAuMDc2Njg1MiwzMS40ODM1OTk3IDI5LjM5NzQ3MDEsMzEuODQwNjYyMSBDMjkuMTk4MzgzOCwzMS45NDUzMjE1IDI4Ljk3NjkwOTMsMzIgMjguNzUyMDczOCwzMiBMMTEuMjA5MzM3OCwzMiBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC4zIj48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yOC4zNTk5OTksMS40OTU0Njg1IEMyOC44MjQ3MTg5LDAuNjAzMjA2NDIgMjkuNzMyNzIyOSwwLjAzMzk5NDI4OTEgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzMwLjcwNjEzNDIsMC4wMDA0OTI5NzU2OTEgMzAuNjc5OTk1LC0xLjIzNTI0NDE0ZS0xNCAzMC42NTM3ODIzLC0xLjIzNTcyNjVlLTE0IEwzMC45NDQ0NDQ0LC0xLjQyMTA4NTQ3ZS0xNCBMMzAuODIyNzM0NywtMS4yMzc1MTE4M2UtMTQgQzMwLjc5MjQ3NjMsLTEuMjMxNTg2OTNlLTE0IDMwLjc2MjI5MTEsMC4wMDA0OTI2NzI2MzUgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzMxLjQ3NzY0NDUsMC4wMjk0ODgzMzM1IDMyLjE1MzkyMTksMC40NTU1Mjk5NjQgMzIuNTAwODM0MSwxLjEyMTYwMTM4IEw0Ny41MjM1MDI5LDI5Ljk2NTEyNTYgQzQ3LjYyNjk4NDQsMzAuMTYzODEgNDcuNjgxMDIzOSwzMC4zODQ1OTQ4IDQ3LjY4MTAyMzksMzAuNjA4Njk1NyBDNDcuNjgxMDIzOSwzMS4zNzcwOTE4IDQ3LjA1OTE5NzIsMzIgNDYuMjkyMTM1MSwzMiBMMzYuNzkwNjYyMiwzMiBDMzYuMDE0NDc2MSwzMiAzNS4zMDI2NDc3LDMxLjU2Nzc1MDIgMzQuOTQzNjEwNCwzMC44NzgzOTg2IEwyNCw5Ljg2NjY2NjY3IEwyOC4zNTk5OTksMS40OTU0Njg1IFoiIGlkPSJzaGFwZSIgZmlsbC1vcGFjaXR5PSIwLjMiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTMwLjY1Mzc4MjMsLTEuMjM1NzI2NWUtMTQgQzMwLjY3OTk5NSwtMS4yMzUyNDQxNGUtMTQgMzAuNzA2MTM0MiwwLjAwMDQ5Mjk3NTY5MSAzMC43MzIxODksMC4wMDE0NzIxODExNSBDMjkuNzMyNzIyOSwwLjAzMzk5NDI4OTEgMjguODI0NzE4OSwwLjYwMzIwNjQyIDI4LjM1OTk5OSwxLjQ5NTQ2ODUgTDI0LDkuODY2NjY2NjcgTDE5LjY0MDAwMSwxLjQ5NTQ2ODUgQzE5LjE2MTI4NDYsMC41NzYzMzMwNiAxOC4yMTIxOCwtMS4yMTc4ODM4M2UtMTQgMTcuMTc3MjY1MywtMS40MjEwODU0N2UtMTQgTDMwLjY1Mzc4MjMsLTEuMjM1NzI2NWUtMTQgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+";
    logoState9.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1sb2dvLXN0YXRlLTA5PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLWxvZ28tc3RhdGUtMDkiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJsb2dvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi4wMDAwMDAsIDIxLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMjQsOS44NjY2NjY2NyBMMTguMjcxMTkyNCwyMSBMNi40NzczOTQ2NiwyMSBDNS43MDEzMTEwMSwyMS4wMDAxMDYzIDQuOTg5NjE3NzYsMjEuMjk5OTMzOSA0LjYzMDYyNzg1LDIxLjk4OTE5NDUgTDE1LjQ5OTE2NTksMS4xMjE2MDEzOCBDMTUuODQ2MDc4MSwwLjQ1NTUyOTk2NCAxNi41MjIzNTU1LDAuMDI5NDg4MzMzNSAxNy4yNjc4MTEsMC4wMDE0NzIxODExNSBDMTcuMjM3NzA4OSwwLjAwMDQ5MjY3MjYzNSAxNy4yMDc1MjM3LDEuOTU5OTMzNjZlLTE0IDE3LjE3NzI2NTMsMS45NTM5OTI1MmUtMTQgTDMwLjY1Mzc4MjMsMi4xMzkzNTE1ZS0xNCBDMzAuNjc5OTk1LDIuMTM5ODMzODVlLTE0IDMwLjcwNjEzNDIsMC4wMDA0OTI5NzU2OTEgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzI5LjczMjcyMjksMC4wMzM5OTQyODkxIDI4LjgyNDcxODksMC42MDMyMDY0MiAyOC4zNTk5OTksMS40OTU0Njg1IEwyNCw5Ljg2NjY2NjY3IFoiIGlkPSJzaGFwZS0yIiBmaWxsLW9wYWNpdHk9IjAuOSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTguMjcxMTkyNCwyMSBMMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEMxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTEuOTg1NTIzOSwzMiAxMS4yMDkzMzc4LDMyIEwxLjcwNzg2NDk1LDMyIEMwLjk0MDgwMjc5NiwzMiAwLjMxODk3NjA1OSwzMS4zNzcwOTE4IDAuMzE4OTc2MDU5LDMwLjYwODY5NTcgQzAuMzE4OTc2MDU5LDMwLjM4NDU5NDggMC4zNzMwMTU2MTgsMzAuMTYzODEgMC40NzY0OTcxMDYsMjkuOTY1MTI1NiBMNC42MzA2Mjc4NSwyMS45ODkxOTQ1IEM0Ljk4OTYxNzc2LDIxLjI5OTkzMzkgNS43MDEzMTEwMSwyMS4wMDAxMDYzIDYuNDc3Mzk0NjYsMjEgTDE4LjI3MTE5MjQsMjEgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTEuMjA5MzM3OCwzMiBDMTEuOTg1NTIzOSwzMiAxMi42OTczNTIzLDMxLjU2Nzc1MDIgMTMuMDU2Mzg5NiwzMC44NzgzOTg2IEwxOC4yNzExOTI0LDIwLjg2NTk3NzMgTDIzLjk1NjQ1ODIsMjAuODY1MTk4MyBDMjQuNzMwOTU2MiwyMC44NjUwOTIyIDI1LjQ0MTU4NjcsMjEuMjk1Mzg0OCAyNS44MDE0ODQ2LDIxLjk4MjM3NjcgTDI5Ljk4MTkwMTUsMjkuOTYyMTc2OSBDMzAuMzM4MzQ0LDMwLjY0MjU3MzIgMzAuMDc2Njg1MiwzMS40ODM1OTk3IDI5LjM5NzQ3MDEsMzEuODQwNjYyMSBDMjkuMTk4MzgzOCwzMS45NDUzMjE1IDI4Ljk3NjkwOTMsMzIgMjguNzUyMDczOCwzMiBMMTEuMjA5MzM3OCwzMiBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC4zIj48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yOC4zNTk5OTksMS40OTU0Njg1IEMyOC44MjQ3MTg5LDAuNjAzMjA2NDIgMjkuNzMyNzIyOSwwLjAzMzk5NDI4OTEgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzMwLjcwNjEzNDIsMC4wMDA0OTI5NzU2OTEgMzAuNjc5OTk1LC0xLjIzNTI0NDE0ZS0xNCAzMC42NTM3ODIzLC0xLjIzNTcyNjVlLTE0IEwzMC45NDQ0NDQ0LC0xLjQyMTA4NTQ3ZS0xNCBMMzAuODIyNzM0NywtMS4yMzc1MTE4M2UtMTQgQzMwLjc5MjQ3NjMsLTEuMjMxNTg2OTNlLTE0IDMwLjc2MjI5MTEsMC4wMDA0OTI2NzI2MzUgMzAuNzMyMTg5LDAuMDAxNDcyMTgxMTUgQzMxLjQ3NzY0NDUsMC4wMjk0ODgzMzM1IDMyLjE1MzkyMTksMC40NTU1Mjk5NjQgMzIuNTAwODM0MSwxLjEyMTYwMTM4IEw0Ny41MjM1MDI5LDI5Ljk2NTEyNTYgQzQ3LjYyNjk4NDQsMzAuMTYzODEgNDcuNjgxMDIzOSwzMC4zODQ1OTQ4IDQ3LjY4MTAyMzksMzAuNjA4Njk1NyBDNDcuNjgxMDIzOSwzMS4zNzcwOTE4IDQ3LjA1OTE5NzIsMzIgNDYuMjkyMTM1MSwzMiBMMzYuNzkwNjYyMiwzMiBDMzYuMDE0NDc2MSwzMiAzNS4zMDI2NDc3LDMxLjU2Nzc1MDIgMzQuOTQzNjEwNCwzMC44NzgzOTg2IEwyNCw5Ljg2NjY2NjY3IEwyOC4zNTk5OTksMS40OTU0Njg1IFoiIGlkPSJzaGFwZSIgZmlsbC1vcGFjaXR5PSIwLjUiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==";
    logoState10.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1sb2dvLXN0YXRlLTEwPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLWxvZ28tc3RhdGUtMTAiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJsb2dvIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNi4wMDAwMDAsIDIxLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMTkuNjQwMDAxLDEuNDk1NDY4NSBMMjQsOS44NjY2NjY2NyBMMTguMjcxMTkyNCwyMSBMNi40NzczOTQ2NiwyMSBDNS43MDEzMTEwMSwyMS4wMDAxMDYzIDQuOTg5NjE3NzYsMjEuMjk5OTMzOSA0LjYzMDYyNzg1LDIxLjk4OTE5NDUgTDE1LjQ5OTE2NTksMS4xMjE2MDEzOCBDMTUuODQ2MDc4MSwwLjQ1NTUyOTk2NCAxNi41MjIzNTU1LDAuMDI5NDg4MzMzNSAxNy4yNjc4MTEsMC4wMDE0NzIxODExNSBDMTguMjY3Mjc3MSwwLjAzMzk5NDI4OTEgMTkuMTc1MjgxMSwwLjYwMzIwNjQyIDE5LjY0MDAwMSwxLjQ5NTQ2ODUgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTEuMjA5MzM3OCwzMiBMMS43MDc4NjQ5NSwzMiBDMC45NDA4MDI3OTYsMzIgMC4zMTg5NzYwNTksMzEuMzc3MDkxOCAwLjMxODk3NjA1OSwzMC42MDg2OTU3IEMwLjMxODk3NjA1OSwzMC4zODQ1OTQ4IDAuMzczMDE1NjE4LDMwLjE2MzgxIDAuNDc2NDk3MTA2LDI5Ljk2NTEyNTYgTDQuNjMwNjI3ODUsMjEuOTg5MTk0NSBDNC45ODk2MTc3NiwyMS4yOTk5MzM5IDUuNzAxMzExMDEsMjEuMDAwMTA2MyA2LjQ3NzM5NDY2LDIxIEwxOC4yMDEzODg5LDIxIEwxOC4yNzExOTI0LDIwLjg2NTk3NzMgTDIzLjk1NjQ1ODIsMjAuODY1MTk4MyBDMjQuNzMwOTU2MiwyMC44NjUwOTIyIDI1LjQ0MTU4NjcsMjEuMjk1Mzg0OCAyNS44MDE0ODQ2LDIxLjk4MjM3NjcgTDI5Ljk4MTkwMTUsMjkuOTYyMTc2OSBDMzAuMzM4MzQ0LDMwLjY0MjU3MzIgMzAuMDc2Njg1MiwzMS40ODM1OTk3IDI5LjM5NzQ3MDEsMzEuODQwNjYyMSBDMjkuMTk4MzgzOCwzMS45NDUzMjE1IDI4Ljk3NjkwOTMsMzIgMjguNzUyMDczOCwzMiBMMTEuMjA5MzM3OCwzMiBaIiBpZD0ic2hhcGUtMiIgZmlsbC1vcGFjaXR5PSIwLjMiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTI4LjM1OTk5OSwxLjQ5NTQ2ODUgQzI4LjgyNDcxODksMC42MDMyMDY0MiAyOS43MzI3MjI5LDAuMDMzOTk0Mjg5MSAzMC43MzIxODksMC4wMDE0NzIxODExNSBDMzAuNzA2MTM0MiwwLjAwMDQ5Mjk3NTY5MSAzMC42Nzk5OTUsLTEuMjM1MjQ0MTRlLTE0IDMwLjY1Mzc4MjMsLTEuMjM1NzI2NWUtMTQgTDMwLjk0NDQ0NDQsLTEuNDIxMDg1NDdlLTE0IEwzMC44MjI3MzQ3LC0xLjIzNzUxMTgzZS0xNCBDMzAuNzkyNDc2MywtMS4yMzE1ODY5M2UtMTQgMzAuNzYyMjkxMSwwLjAwMDQ5MjY3MjYzNSAzMC43MzIxODksMC4wMDE0NzIxODExNSBDMzEuNDc3NjQ0NSwwLjAyOTQ4ODMzMzUgMzIuMTUzOTIxOSwwLjQ1NTUyOTk2NCAzMi41MDA4MzQxLDEuMTIxNjAxMzggTDQ3LjUyMzUwMjksMjkuOTY1MTI1NiBDNDcuNjI2OTg0NCwzMC4xNjM4MSA0Ny42ODEwMjM5LDMwLjM4NDU5NDggNDcuNjgxMDIzOSwzMC42MDg2OTU3IEM0Ny42ODEwMjM5LDMxLjM3NzA5MTggNDcuMDU5MTk3MiwzMiA0Ni4yOTIxMzUxLDMyIEwzNi43OTA2NjIyLDMyIEMzNi4wMTQ0NzYxLDMyIDM1LjMwMjY0NzcsMzEuNTY3NzUwMiAzNC45NDM2MTA0LDMwLjg3ODM5ODYgTDI0LDkuODY2NjY2NjcgTDI4LjM1OTk5OSwxLjQ5NTQ2ODUgWiIgaWQ9InNoYXBlIiBmaWxsLW9wYWNpdHk9IjAuNSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMzAuNjUzNzgyMywtMS4yMzU3MjY1ZS0xNCBDMzAuNjc5OTk1LC0xLjIzNTI0NDE0ZS0xNCAzMC43MDYxMzQyLDAuMDAwNDkyOTc1NjkxIDMwLjczMjE4OSwwLjAwMTQ3MjE4MTE1IEMyOS43MzI3MjI5LDAuMDMzOTk0Mjg5MSAyOC44MjQ3MTg5LDAuNjAzMjA2NDIgMjguMzU5OTk5LDEuNDk1NDY4NSBMMjQsOS44NjY2NjY2NyBMMTkuNjQwMDAxLDEuNDk1NDY4NSBDMTkuMTYxMjg0NiwwLjU3NjMzMzA2IDE4LjIxMjE4LC0xLjIxNzg4MzgzZS0xNCAxNy4xNzcyNjUzLC0xLjQyMTA4NTQ3ZS0xNCBMMzAuNjUzNzgyMywtMS4yMzU3MjY1ZS0xNCBaIiBpZD0ic2hhcGUiIGZpbGwtb3BhY2l0eT0iMC45Ij48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=";

    setUpStylesForAnimatedLogoParts([
        logoState1,
        logoState2,
        logoState3,
        logoState4,
        logoState5,
        logoState6,
        logoState7,
        logoState8,
        logoState9,
        logoState10,
    ]);

    // Define base styles for triangle bellow the microphone btn
    defaultStateBtnIconImg.alt = alanAltText + ' button icon for idle state';
    listenStateBtnIconImg.alt = alanAltText + ' button icon for listening state';
    processStateBtnIconImg.alt = alanAltText + ' button icon for processing state';
    replyStateBtnIconImg.alt = alanAltText + ' button icon for reply state';

    var logoImgs = [
        defaultStateBtnIconImg,
        listenStateBtnIconImg,
        processStateBtnIconImg,
        replyStateBtnIconImg
    ];
    defaultStateBtnIconImg.src = micIconSrc;
    for (var i = 0; i < logoImgs.length; i++) {
        var logoImgEl = logoImgs[i];
        logoImgEl.style.minHeight = '100%';
        logoImgEl.style.height = '100%';
        logoImgEl.style.maxHeight = '100%';
        logoImgEl.style.minWidth = '100%';
        logoImgEl.style.width = '100%';
        logoImgEl.style.maxWidth = '100%';
        logoImgEl.style.top = '0%';
        logoImgEl.style.left = '0%';
        logoImgEl.style.position = 'absolute';
        logoImgEl.style.pointerEvents = 'none';
        logoImgEl.style.borderRadius = '50%';
        micIconDiv.appendChild(logoImgEl);
    }

    roundedTriangleIconDiv.style.minHeight = '100%';
    roundedTriangleIconDiv.style.height = '100%';
    roundedTriangleIconDiv.style.maxHeight = '100%';
    roundedTriangleIconDiv.style.minWidth = '100%';
    roundedTriangleIconDiv.style.width = '100%';
    roundedTriangleIconDiv.style.maxWidth = '100%';
    roundedTriangleIconDiv.style.top = '0%';
    roundedTriangleIconDiv.style.left = '0%';
    roundedTriangleIconDiv.style.zIndex = btnIconsZIndex;
    roundedTriangleIconDiv.style.position = 'absolute';
    roundedTriangleIconDiv.style.opacity = 0;
    roundedTriangleIconDiv.style.transition = transitionCss;
    roundedTriangleIconDiv.style.overflow = 'hidden';
    roundedTriangleIconDiv.style.borderRadius = '50%';
    roundedTriangleIconDiv.style.backgroundSize = '100% 100%';
    roundedTriangleIconDiv.style.backgroundPosition = 'center center';
    roundedTriangleIconDiv.style.backgroundRepeat = 'no-repeat';
    roundedTriangleIconDiv.alt = alanAltText + ' microphone icon';
    roundedTriangleIconDiv.classList.add('triangleMicIconBg');
    roundedTriangleIconDiv.classList.add('triangleMicIconBg-default');

    circleIconDiv.style.minHeight = '100%';
    circleIconDiv.style.height = '100%';
    circleIconDiv.style.maxHeight = '100%';
    circleIconDiv.style.minWidth = '100%';
    circleIconDiv.style.width = '100%';
    circleIconDiv.style.maxWidth = '100%';
    circleIconDiv.style.top = '0%';
    circleIconDiv.style.left = '0%';
    circleIconDiv.style.zIndex = btnIconsZIndex;
    circleIconDiv.style.position = 'absolute';
    circleIconDiv.style.opacity = 0;
    circleIconDiv.style.transition = transitionCss;
    circleIconDiv.style.overflow = 'hidden';
    circleIconDiv.style.borderRadius = '50%';
    circleIconDiv.style.backgroundSize = '0% 0%';
    circleIconDiv.style.backgroundPosition = 'center center';
    circleIconDiv.style.backgroundRepeat = 'no-repeat';
    circleIconDiv.alt = alanAltText + ' microphone circle icon';
    circleIconDiv.classList.add('circleMicIconBg');

    // Define base styles for loader mic icon in disconnected state
    disconnectedMicLoaderIconImg.style.minHeight = '70%';
    disconnectedMicLoaderIconImg.style.height = '70%';
    disconnectedMicLoaderIconImg.style.maxHeight = '70%';
    disconnectedMicLoaderIconImg.style.top = '15%';
    disconnectedMicLoaderIconImg.style.left = '15%';
    disconnectedMicLoaderIconImg.style.zIndex = btnIconsZIndex;
    disconnectedMicLoaderIconImg.style.position = 'absolute';
    disconnectedMicLoaderIconImg.style.transition = transitionCss;
    disconnectedMicLoaderIconImg.style.opacity = '0';
    disconnectedMicLoaderIconImg.alt = alanAltText + ' disconnected microphone icon';
    disconnectedMicLoaderIconImg.src = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiB2aWV3Qm94PSIwIDAgMTkyIDE5MiI+CiAgICA8ZyBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTk2IDBjNTMuMDIgMCA5NiA0Mi45OCA5NiA5NnMtNDIuOTggOTYtOTYgOTZTMCAxNDkuMDIgMCA5NiA0Mi45OCAwIDk2IDB6IiBvcGFjaXR5PSIuMDIiLz4KICAgICAgICA8cGF0aCBkPSJNMTMxLjk2NiAxOS4wOTJjLTMwLTE0LTY1LjI4NC05Ljg0OS05MS4xNDIgMTIuNTc1QzE0Ljk2NiA1NC4wOTIgNi44NSA4My44MSAxMi45MDggMTEzLjk1YzYuMDU4IDMwLjE0MiAzMC4zMDIgNTYuMTkgNjAuMDU4IDY0LjE0MiAzNS4xODMgOS40MDYgNzMtNCA5My0zNC0xNy45MjQgMjMuOTE2LTUyLjM2NiAzOC4yOTMtODMgMzMtMzAuMTY4LTUuMjEtNTcuMTA0LTMxLjExLTY0LTYxLTcuMzQ3LTMxLjgzNS43NzktNTYgMjctODBzODAtMjYgMTA5IDljNS41MzYgNi42ODEgMTMgMTkgMTUgMzQgMSA2IDEgNyAyIDEyIDAgMiAyIDQgNCA0IDMgMCA1LjM3NC0yLjI1NiA1LTYtMy0zMC0yMS41NTYtNTcuMTkzLTQ5LTcweiIgb3BhY2l0eT0iLjQiLz4KICAgIDwvZz4KPC9zdmc+Cg==";
    disconnectedMicLoaderIconImg.style.animation = disconnectedLoaderAnimation;

    // Define base styles for mic icon in low valume state
    lowVolumeMicIconImg.style.minHeight = '100%';
    lowVolumeMicIconImg.style.height = '100%';
    lowVolumeMicIconImg.style.maxHeight = '100%';
    lowVolumeMicIconImg.style.top = '0%';
    lowVolumeMicIconImg.style.left = '0%';
    lowVolumeMicIconImg.style.zIndex = btnIconsZIndex;
    lowVolumeMicIconImg.style.position = 'absolute';
    lowVolumeMicIconImg.style.transition = transitionCss;
    lowVolumeMicIconImg.style.opacity = '0';
    lowVolumeMicIconImg.alt = alanAltText + ' low volume icon';
    lowVolumeMicIconImg.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1uby1taWM8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0iQWxhbi1CdXR0b24tLy1BbmltYXRpb24tLy1idXR0b24tbm8tbWljIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iaWNvbiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjIuMDAwMDAwLCAxOS4wMDAwMDApIiBmaWxsPSIjRkZGRkZGIiBmaWxsLXJ1bGU9Im5vbnplcm8iPgogICAgICAgICAgICA8cGF0aCBkPSJNMzIsMTguNDczNjg0MiBDMzIsMjUuNzE5NDczNyAyNi43OCwzMS42OTI2MzE2IDIwLDMyLjY5ODQyMTEgTDIwLDQwIEMyMCw0MS4xMDQ1Njk1IDE5LjEwNDU2OTUsNDIgMTgsNDIgQzE2Ljg5NTQzMDUsNDIgMTYsNDEuMTA0NTY5NSAxNiw0MCBMMTYsMzIuNjk4NDIxMSBDOS4yMiwzMS42OTI2MzE2IDQsMjUuNzE5NDczNyA0LDE4LjQ3MzY4NDIgTDQsMTggQzQsMTYuODk1NDMwNSA0Ljg5NTQzMDUsMTYgNiwxNiBDNy4xMDQ1Njk1LDE2IDgsMTYuODk1NDMwNSA4LDE4IEw4LDE4LjQ3MzY4NDIgQzgsMjQuMTQxODY5OCAxMi40NzcxNTI1LDI4LjczNjg0MjEgMTgsMjguNzM2ODQyMSBDMjMuNTIyODQ3NSwyOC43MzY4NDIxIDI4LDI0LjE0MTg2OTggMjgsMTguNDczNjg0MiBMMjgsMTggQzI4LDE2Ljg5NTQzMDUgMjguODk1NDMwNSwxNiAzMCwxNiBDMzEuMTA0NTY5NSwxNiAzMiwxNi44OTU0MzA1IDMyLDE4IEwzMiwxOC40NzM2ODQyIFoiIGlkPSJTaGFwZSIgZmlsbC1vcGFjaXR5PSIwLjgiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTE4LC00LjUyNzM3MjYzZS0xNCBDMjEuMzEzNzA4NSwtNC42MTg1Mjc3OGUtMTQgMjQsMi43NTY5ODMzOCAyNCw2LjE1Nzg5NDc0IEwyNCwxOC40NzM2ODQyIEMyNCwyMS44NzQ1OTU2IDIxLjMxMzcwODUsMjQuNjMxNTc4OSAxOCwyNC42MzE1Nzg5IEMxNC42ODYyOTE1LDI0LjYzMTU3ODkgMTIsMjEuODc0NTk1NiAxMiwxOC40NzM2ODQyIEwxMiw2LjE1Nzg5NDc0IEMxMiwyLjc1Njk4MzM4IDE0LjY4NjI5MTUsLTQuNTI3MzcyNjNlLTE0IDE4LC00LjYxODUyNzc4ZS0xNCBaIiBpZD0iU2hhcGUiIGZpbGwtb3BhY2l0eT0iMC42Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0zLjgxLDMuMjcgTDM0LjczLDM0LjE5IEMzNS40MzE0MDE2LDM0Ljg5MTQwMTYgMzUuNDMxNDAxNiwzNi4wMjg1OTg0IDM0LjczLDM2LjczIEMzNC4wMjg1OTg0LDM3LjQzMTQwMTYgMzIuODkxNDAxNiwzNy40MzE0MDE2IDMyLjE5LDM2LjczIEwxLjI3LDUuODEgQzAuNTY4NTk4MzY4LDUuMTA4NTk4MzcgMC41Njg1OTgzNjgsMy45NzE0MDE2MyAxLjI3LDMuMjcgQzEuOTcxNDAxNjMsMi41Njg1OTgzNyAzLjEwODU5ODM3LDIuNTY4NTk4MzcgMy44MSwzLjI3IFoiIGlkPSJQYXRoIj48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=\n";

    // Define base styles for noVoiceSupport icon in low valume state
    noVoiceSupportMicIconImg.style.minHeight = '100%';
    noVoiceSupportMicIconImg.style.height = '100%';
    noVoiceSupportMicIconImg.style.maxHeight = '100%';
    noVoiceSupportMicIconImg.style.top = '0%';
    noVoiceSupportMicIconImg.style.left = '0%';
    noVoiceSupportMicIconImg.style.zIndex = btnIconsZIndex;
    noVoiceSupportMicIconImg.style.position = 'absolute';
    noVoiceSupportMicIconImg.style.transition = transitionCss;
    noVoiceSupportMicIconImg.style.opacity = '0';
    noVoiceSupportMicIconImg.alt = alanAltText + ' no voice support icon';
    noVoiceSupportMicIconImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIuSURBVHgB7dvxUYMwFAbwpxMwAhvoBtVJygZ1A92gI1Qn6AjoBO0GsEG7wfPlgCtNA7xASzX5fnf5oyThLp+BQDiJAAAAAAAAAAAAAAAAxmHmDyk5n+ykLAn6SUhpHVaXwrQhcBsIr5FTLGSwb1IOmpkj9RnrxXE5+1x+fH7Pwyw0+PKSLLpCrGeq1oFiwNWiUGhCZE8UC22I7IliogmRPVFshkJkTxSjvhDZE8WqJ0QEqNURIgL0MTVEgmkhElTGhkix4WqzoNlYWFp1k1fhvvMHgc9n2cFRPzXAou/8t/JAM7EH/SD66ocM9bfrb+WR7kTGm1iHjqR3HDjXbOYMsLR+p9bvPentr3iuSeYM0B7Uwvr9RXqfA+cqKTRyma2sdSB3tMlZJ7X62Ru3Qa7CiSOIF6uN9pmw4NMuTjYUcDAcM8wEkTjaZdasytm9AfHsOL6lUJkZx5c2yr7a2ZlSyGSAa8egt5qBK0JU/TH+Na7uha4QzLHBm7+0ee8Iz/Sf/XlwtjeRtnq2mVU4dVSXUr6l/NDpccS0e5KSSekKybR9lReQkmLAV9hU7ZiFKcWCq8t5zeOtWfndOWhczcYN6+VSFq2+RfQhGnUYWUeY5ph5m0k6+iHENjs9RXuE2OYbYN3HFeKOYjQmwLrfRYgUo7EB1n2bEM03khXd0F0epDXs0Obaovd1ty39UCDAif5ygO0PRyWBH64eqJuFAP9kAwAAAAAAAAAAAAAAU/wC52820szaQtwAAAAASUVORK5CYII=";
    
    // Define base styles for ovals
    var defaultBtnColorOptions = {
        "idle": {
            "background": {
                "color": [
                    'rgb(34, 203, 255)',
                    'rgb(25, 149, 255)'
                ]
            },
            "hover": {
                "color": [
                    'rgba(0, 70, 255, 0.95)',
                    'rgba(0, 156,  255, 0.95)'
                ]
            }
        },
        "listen": {
            "background": {
                "color": [
                    'rgba(0, 70, 255, 0.95)',
                    'rgba(0, 156,  255, 0.95)'
                ]
            },
            "hover": {
                "color": ['rgba(0, 70, 255, 0.95)',
                    'rgb(0, 70, 255)']
            },
        },
        "process": {
            "background": {
                "color": [
                    'rgba(0, 255, 205, 0.95)',
                    'rgba(0, 115, 255, 0.95)'
                ]

            },
            "hover": {
                "color": [
                    'rgb(0, 115, 255)',
                    'rgba(0, 115, 255, 0.95)'
                ]
            }
        },

        "reply": {
            "background": {
                "color": [
                    'rgba(122, 40, 255, 0.95)',
                    'rgba(61, 122, 255, 0.95)'
                ]
            },
            "hover": {
                "color": [
                    'rgba(122, 40, 255, 0.95)',
                    'rgb(122, 40, 255)'
                ]
            },
        }
    };

    btnOval1.style.transform = 'rotate(-315deg)';
    btnOval2.style.transform = 'rotate(-45deg)';

    applySizeSettingsToBlurLayers([ btnOval1, btnOval2 ]);

    function applySizeSettingsToBlurLayers(elements) {
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            el.style.height = btnSize / 2 + 'px';
            el.style.maxHeight = btnSize / 2 + 'px';
            el.style.minHeight = btnSize / 2 + 'px';
            el.style.minWidth = btnSize + 'px';
            el.style.width = btnSize + 'px';
            el.style.maxWidth = btnSize + 'px';
            el.style.top = 'calc(100%/2 - ' + btnSize / 2 / 2 + 'px)';
            el.style.filter = 'blur(' + btnSize / 10 + 'px)';
            el.style.left = 0;
            el.style.zIndex = btnBgLayerZIndex;
            el.style.position = 'absolute';
            el.style.transition = transitionCss;
            el.style.opacity = '.5';
            el.style.borderRadius = '100px';
            el.classList.add('alanBtn-oval-bg-default');
        }
    }

    // Define base styles for mic icon in offline state
    offlineIconImg.style.minHeight = '100%';
    offlineIconImg.style.height = '100%';
    offlineIconImg.style.maxHeight = '100%';
    offlineIconImg.style.top = '0%';
    offlineIconImg.style.left = '0%';
    offlineIconImg.style.zIndex = btnIconsZIndex;
    offlineIconImg.style.position = 'absolute';
    offlineIconImg.style.transition = transitionCss;
    offlineIconImg.style.opacity = '0';
    offlineIconImg.alt = alanAltText + ' offline icon';
    offlineIconImg.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODBweCIgaGVpZ2h0PSI4MHB4IiB2aWV3Qm94PSIwIDAgODAgODAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjEgKDY3MDQ4KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5BbGFuIEJ1dHRvbiAvIEFuaW1hdGlvbiAvIGJ1dHRvbi1uby1uZXR3b3JrPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkFsYW4tQnV0dG9uLS8tQW5pbWF0aW9uLS8tYnV0dG9uLW5vLW5ldHdvcmsiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJpY29uIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMS4wMDAwMDAsIDIyLjAwMDAwMCkiIGZpbGw9IiNGRkZGRkYiPgogICAgICAgICAgICA8cGF0aCBkPSJNMzMsMiBDMzQuNjU2ODU0MiwyIDM2LDMuMzQzMTQ1NzUgMzYsNSBMMzYsMjkgQzM2LDMwLjY1Njg1NDIgMzQuNjU2ODU0MiwzMiAzMywzMiBDMzEuMzQzMTQ1OCwzMiAzMCwzMC42NTY4NTQyIDMwLDI5IEwzMCw1IEMzMCwzLjM0MzE0NTc1IDMxLjM0MzE0NTgsMiAzMywyIFoiIGlkPSJTaGFwZSIgZmlsbC1vcGFjaXR5PSIwLjQiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTIzLDggQzI0LjY1Njg1NDIsOCAyNiw5LjM0MzE0NTc1IDI2LDExIEwyNiwyOSBDMjYsMzAuNjU2ODU0MiAyNC42NTY4NTQyLDMyIDIzLDMyIEMyMS4zNDMxNDU4LDMyIDIwLDMwLjY1Njg1NDIgMjAsMjkgTDIwLDExIEMyMCw5LjM0MzE0NTc1IDIxLjM0MzE0NTgsOCAyMyw4IFoiIGlkPSJTaGFwZSIgZmlsbC1vcGFjaXR5PSIwLjYiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTEzLDE2IEMxNC42NTY4NTQyLDE2IDE2LDE3LjM0MzE0NTggMTYsMTkgTDE2LDI5IEMxNiwzMC42NTY4NTQyIDE0LjY1Njg1NDIsMzIgMTMsMzIgQzExLjM0MzE0NTgsMzIgMTAsMzAuNjU2ODU0MiAxMCwyOSBMMTAsMTkgQzEwLDE3LjM0MzE0NTggMTEuMzQzMTQ1OCwxNiAxMywxNiBaIiBpZD0iU2hhcGUiIGZpbGwtb3BhY2l0eT0iMC44Ij48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0zLDIyIEM0LjY1Njg1NDI1LDIyIDYsMjMuMzQzMTQ1OCA2LDI1IEw2LDI5IEM2LDMwLjY1Njg1NDIgNC42NTY4NTQyNSwzMiAzLDMyIEMxLjM0MzE0NTc1LDMyIDIuMDI5MDYxMjVlLTE2LDMwLjY1Njg1NDIgMCwyOSBMMCwyNSBDLTIuMDI5MDYxMjVlLTE2LDIzLjM0MzE0NTggMS4zNDMxNDU3NSwyMiAzLDIyIFoiIGlkPSJTaGFwZSI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNNS44MSwxLjI3IEwzNi43MywzMi4xOSBDMzcuNDMxNDAxNiwzMi44OTE0MDE2IDM3LjQzMTQwMTYsMzQuMDI4NTk4NCAzNi43MywzNC43MyBDMzYuMDI4NTk4NCwzNS40MzE0MDE2IDM0Ljg5MTQwMTYsMzUuNDMxNDAxNiAzNC4xOSwzNC43MyBMMy4yNywzLjgxIEMyLjU2ODU5ODM3LDMuMTA4NTk4MzcgMi41Njg1OTgzNywxLjk3MTQwMTYzIDMuMjcsMS4yNyBDMy45NzE0MDE2MywwLjU2ODU5ODM2OCA1LjEwODU5ODM3LDAuNTY4NTk4MzY4IDUuODEsMS4yNyBaIiBpZD0iUGF0aCIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=\n";

    var popupCloseIconImgBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcuNzczNDUgNy4wMDAwM0wxMy44Mzk4IDAuOTMzNjA0QzE0LjA1MzQgMC43MjAwMjIgMTQuMDUzNCAwLjM3Mzc0MSAxMy44Mzk4IDAuMTYwMTg2QzEzLjYyNjMgLTAuMDUzMzY4MSAxMy4yOCAtMC4wNTMzOTU1IDEzLjA2NjQgMC4xNjAxODZMNyA2LjIyNjYxTDAuOTMzNjA0IDAuMTYwMTg2QzAuNzIwMDIyIC0wLjA1MzM5NTUgMC4zNzM3NDEgLTAuMDUzMzk1NSAwLjE2MDE4NiAwLjE2MDE4NkMtMC4wNTMzNjgxIDAuMzczNzY4IC0wLjA1MzM5NTUgMC43MjAwNDkgMC4xNjAxODYgMC45MzM2MDRMNi4yMjY1OSA3TDAuMTYwMTg2IDEzLjA2NjRDLTAuMDUzMzk1NSAxMy4yOCAtMC4wNTMzOTU1IDEzLjYyNjMgMC4xNjAxODYgMTMuODM5OEMwLjI2Njk2NCAxMy45NDY2IDAuNDA2OTM2IDE0IDAuNTQ2OTA5IDE0QzAuNjg2ODgxIDE0IDAuODI2ODI3IDEzLjk0NjYgMC45MzM2MzEgMTMuODM5OEw3IDcuNzczNDVMMTMuMDY2NCAxMy44Mzk4QzEzLjE3MzIgMTMuOTQ2NiAxMy4zMTMyIDE0IDEzLjQ1MzEgMTRDMTMuNTkzMSAxNCAxMy43MzMgMTMuOTQ2NiAxMy44Mzk4IDEzLjgzOThDMTQuMDUzNCAxMy42MjYzIDE0LjA1MzQgMTMuMjggMTMuODM5OCAxMy4wNjY0TDcuNzczNDUgNy4wMDAwM1oiIGZpbGw9IiNCQkNGRTciLz4KPC9zdmc+Cg==";

    btnBgDefault.classList.add('alanBtn-bg-default');
    btnBgListening.classList.add('alanBtn-bg-listening');
    btnBgSpeaking.classList.add('alanBtn-bg-speaking');
    btnBgIntermediate.classList.add('alanBtn-bg-intermediate');
    btnBgUnderstood.classList.add('alanBtn-bg-understood');

    applyBgStyles(btnBgDefault);
    applyBgStyles(btnBgListening);
    applyBgStyles(btnBgSpeaking);
    applyBgStyles(btnBgIntermediate);
    applyBgStyles(btnBgUnderstood);

    var onOpacity = 1;
    var offOpacity = 0;


    btnBgDefault.style.opacity = onOpacity;

    var allIcons = [
        circleIconDiv,
        roundedTriangleIconDiv,
        micIconDiv,
        offlineIconImg,
        lowVolumeMicIconImg,
        noVoiceSupportMicIconImg,
        logoState1,
        logoState2,
        logoState3,
        logoState4,
        logoState5,
        logoState6,
        logoState7,
        logoState8,
        logoState9,
        logoState10,
    ];

    for (i = 0; i < allIcons.length; i++) {
        allIcons[i].setAttribute('draggable', 'false');
    }

    hideLayers([
        btnBgListening,
        btnBgSpeaking,
        btnBgIntermediate,
        btnBgUnderstood,
    ]);

    btn.appendChild(btnOval1);
    btn.appendChild(btnOval2);
    btn.appendChild(btnBgDefault);
    btn.appendChild(btnBgListening);
    btn.appendChild(btnBgSpeaking);
    btn.appendChild(btnBgIntermediate);
    btn.appendChild(btnBgUnderstood);
    btn.appendChild(micIconDiv);
    btn.appendChild(roundedTriangleIconDiv);
    btn.appendChild(circleIconDiv);
    btn.appendChild(disconnectedMicLoaderIconImg);
    btn.appendChild(lowVolumeMicIconImg);
    btn.appendChild(noVoiceSupportMicIconImg);
    btn.appendChild(offlineIconImg);
    btn.classList.add("alanBtn");

    if(isMobile()){
        rootEl.classList.add("mobile");
    }

    //#endregion

    //#region Add needed styles to the page
    createAlanStyleSheet();

    function getStyleSheetMarker(andFlag) {
        return '.alan-' + getProjectId() + (andFlag ? '' : ' ');
    }

    function createAlanStyleSheet(btnOptions) {
        var style;
        var keyFrames = '';
        var projectId = getProjectId();

        var existingStyleSheet;

        if (options.shadowDOM) {
            existingStyleSheet = options.shadowDOM.getElementById('alan-stylesheet-' + projectId);
        } else {
            existingStyleSheet = document.getElementById('alan-stylesheet-' + projectId);
        }

        if (existingStyleSheet) {
            existingStyleSheet.disabled = true;
            existingStyleSheet.parentNode.removeChild(existingStyleSheet);
        }

        style = document.createElement('style');
        style.setAttribute('id', 'alan-stylesheet-' + projectId);
        style.type = 'text/css';

        keyFrames += '.alanBtn-root * {  box-sizing: border-box; font-family: Helvetica, Arial, sans-serif; -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;}';
        
        var hoverSelector = !isMobile() ? ':hover' : ':active';
        
        if (!isMobile()) {
            keyFrames += getStyleSheetMarker() + '.alanBtn{transform: scale(1);'+ transitionCss +';} .alanBtn' + hoverSelector + '{transform: scale(1.11111);transition:' + transitionCss + ';}.alanBtn:focus {transform: scale(1);' + transitionCss + ';  border: solid 3px #50e3c2;  outline: none;  }';
        }
        
        keyFrames += getStyleSheetMarker() + '.alanBtn-recognised-text-holder { position:fixed; transform: translateY(' + (isTopAligned ? '-' : '') +'50%); max-width:236px; font-family: Helvetica, Arial, sans-serif; font-size: 14px; line-height: 18px;  min-height: 40px;  color: #000; font-weight: normal; background-color: #fff; border-radius:10px; box-shadow: 0px 1px 14px rgba(0, 0, 0, 0.35); display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-orient:horizontal;-webkit-box-direction:normal;-ms-flex-direction:row;flex-direction:row;-webkit-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack: activate;-ms-flex-pack: start;justify-content: start;}';
        
        keyFrames += getStyleSheetMarker() + ' .alanBtn-recognised-text-holder.with-text.left-side { text-align: left;}';
        keyFrames += getStyleSheetMarker() + ' .alanBtn-recognised-text-holder.with-text.right-side { text-align: right;}';

        keyFrames += getStyleSheetMarker() + ' .alanBtn-recognised-text-holder .alanBtn-recognised-text-content:not(:empty) {padding: 10px;}';
        
        keyFrames += getStyleSheetMarker(true) + '.alanBtn-recognised-text-holder-long  { font-size: 12px!important;line-height: 1.4!important;}  ';
        keyFrames += getStyleSheetMarker(true) + '.alanBtn-recognised-text-holder-super-long  { font-size: 11px!important;line-height: 1.4!important;}  ';

        keyFrames += getStyleSheetMarker() + '.alanBtn-text-appearing {  animation: text-holder-appear 800ms ease-in-out forwards;  }';
        keyFrames += getStyleSheetMarker() + '.alanBtn-text-disappearing {  animation: text-holder-disappear 800ms ease-in-out forwards;    }';
        keyFrames += getStyleSheetMarker() + '.alanBtn-text-disappearing-immediately {  animation: none; opactity: 0;   }';

        keyFrames += getStyleSheetMarker() + '.alan-btn-disabled {  pointer-events: none;  opacity: .5;  transition: all .2s ease-in-out;  }';
        keyFrames += getStyleSheetMarker() + '.shadow-appear {  opacity: 1 !important;  }\n';
        keyFrames += getStyleSheetMarker() + '.shadow-disappear {  opacity: 0 !important;  transition: all .1s linear !important;  }';

        keyFrames += getStyleSheetMarker(true) + '.alan-btn-offline .alanBtn-bg-default {  background-image: linear-gradient(122deg,rgb(78,98,126),rgb(91,116,145));}';
        keyFrames += getStyleSheetMarker(true) + '.alan-btn-offline .alanBtn' + hoverSelector + ' .alanBtn-bg-default {  background-image: linear-gradient(122deg,rgb(78,98,126),rgb(91,116,145))!important;}';

        keyFrames += getStyleSheetMarker(true) + '.alan-btn-no-voice-support .alanBtn-bg-default {  background-image: linear-gradient(122deg,rgb(78,98,126),rgb(91,116,145));}';
        keyFrames += getStyleSheetMarker(true) + '.alan-btn-no-voice-support .alanBtn' + hoverSelector + ' .alanBtn-bg-default {  background-image: linear-gradient(122deg,rgb(78,98,126),rgb(91,116,145))!important;}';

        keyFrames += getStyleSheetMarker(true) + '.alan-btn-permission-denied .alanBtn .alanBtn-bg-default {  background-image: linear-gradient(122deg,rgb(78,98,126),rgb(91,116,145));}';
        keyFrames += getStyleSheetMarker(true) + '.alan-btn-permission-denied .alanBtn' + hoverSelector + ' .alanBtn-bg-default {  background-image: linear-gradient(122deg,rgb(78,98,126),rgb(91,116,145))!important;}';

        keyFrames += getStyleSheetMarker() + '.triangleMicIconBg {background-image:url(' + roundedTriangleSecondLayerSrc + '); pointer-events: none;}';
        keyFrames += getStyleSheetMarker() + '.circleMicIconBg {background-image:url(' + circleSecondLayerSrc + '); pointer-events: none;}';
        keyFrames += getStyleSheetMarker() + ' img {pointer-events: none;}';
        keyFrames += getStyleSheetMarker() + '' + hoverSelector + ' .triangleMicIconBg-default {opacity:0!important;}';
        
        keyFrames += getStyleSheetMarker() + '.alan-overlay-for-alert {position: fixed;top: 0;left: 0;right: 0;bottom: 0;z-index: 99;background: rgba(0, 0, 0, 0.57);opacity: 0;-webkit-animation: alan-fade-in 0.5s 0.2s forwards;-moz-animation: alan-fade-in 0.5s 0.2s forwards;-o-animation: alan-fade-in 0.5s 0.2s forwards;animation: alan-fade-in 0.5s 0.2s forwards;}';
        keyFrames += getStyleSheetMarker() + '.alan-alert-popup {border-radius:10px; box-shadow: 0px 5px 14px rgba(3, 3, 3, 0.25);padding:12px;padding-right:24px;text-align: center;width: 220px;background: rgb(255 255 255);position: fixed;left: 50%;transform: translateX(-50%);top: 10%;    color: #000;font-size: 14px;line-height: 18px;}';
        keyFrames += getStyleSheetMarker() + '.alan-alert-popup__close-btn {background:url("' + popupCloseIconImgBase64 + '") no-repeat center;cursor:pointer; background-size:100% 100%;position: absolute;top: 12px;right: 12px;width: 14px;height: 14px;}';
        
        keyFrames += getStyleSheetMarker() + '.alan-overlay {position: fixed;top: 0;left: 0;right: 0;bottom: 0;z-index: 99;background: rgba(0, 0, 0, 0.57);opacity: 0;-webkit-animation: alan-fade-in 0.5s 0.2s forwards;-moz-animation: alan-fade-in 0.5s 0.2s forwards;-o-animation: alan-fade-in 0.5s 0.2s forwards;animation: alan-fade-in 0.5s 0.2s forwards;}';
        keyFrames += getStyleSheetMarker() + '.alan-overlay-popup.default-popup {border-radius:10px; box-shadow: 0px 5px 14px rgba(3, 3, 3, 0.25);padding:6px 30px 6px 12px;text-align: left;width: 220px;background: rgb(255 255 255);}';
        keyFrames += getStyleSheetMarker() + '.alan-overlay-popup.top.right {border-top-right-radius: 0!important;}';
        keyFrames += getStyleSheetMarker() + '.alan-overlay-popup.top.left {border-top-left-radius: 0!important;}';
        keyFrames += getStyleSheetMarker() + '.alan-overlay-popup.bottom.left {border-bottom-left-radius: 0!important;}';
        keyFrames += getStyleSheetMarker() + '.alan-overlay-popup.bottom.right {border-bottom-right-radius: 0!important;}';
        keyFrames += getStyleSheetMarker() + '.alan-overlay-popup {position: fixed;opacity: 0;-webkit-animation: alan-fade-in 0.5s 0.2s forwards;-moz-animation: alan-fade-in 0.5s 0.2s forwards;-o-animation: alan-fade-in 0.5s 0.2s forwards;animation: alan-fade-in 0.5s 0.2s forwards;}';
        keyFrames += getStyleSheetMarker() + '.alan-overlay-popup__body {position:relative;color: #0D1940;font-size: 16px;line-height: 20px;}';
        keyFrames += getStyleSheetMarker() + '.alan-overlay-popup__ok {background:url("' + popupCloseIconImgBase64 + '") no-repeat center; background-size:100% 100%;min-height:14px;height:14px;max-height:14px;min-width:14px;width:14px;max-width:14px;opacity:0;transition:opacity 300ms ease-in-out;position:absolute;top:8px;right:8px;cursor: pointer;pointer-events: auto!important;}';
        keyFrames += getStyleSheetMarker() + '.alan-overlay-popup__ok:hover {opacity:0.9}';
        keyFrames += getStyleSheetMarker() + '.alan-overlay-popup:hover .alan-overlay-popup__ok{opacity:1;transition:opacity 300ms ease-in-out;}';
        
        keyFrames += getStyleSheetMarker() + generateKeyFrame('alan-gradient', '0%{backgroundPosition: 0 0;}50%{backgroundPosition: -100% 0;}100%{backgroundPosition: 0 0;}');
        keyFrames += getStyleSheetMarker() + generateKeyFrame('alan-pulsating', '0%{transform: scale(1.11111);}50%{transform: scale(1.0);}100%{transform: scale(1.11111);}');
        keyFrames += getStyleSheetMarker() + generateKeyFrame('alan-mic-pulsating', '0%{transform: scale(0.91);}50%{transform: scale(1.0);}100%{transform: scale(0.91);}');
        keyFrames += getStyleSheetMarker() + generateKeyFrame('alan-triangle-mic-pulsating', '0%{transform: scale(0.94);}50%{transform: scale(1.0);}100%{transform: scale(0.94);}');
        keyFrames += getStyleSheetMarker() + generateKeyFrame('alan-fade-in', '0%{opacity: 0;}100%{opacity:1;}');
        keyFrames += getStyleSheetMarker() + generateKeyFrame('alan-fade-out', '0%{opacity: 1;}100%{opacity:0;}');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('text-holder-appear',
            '0%{' +
            'opacity:0; ' +
            'color:transparent; ' +
            'background-color:rgba(245, 252, 252, 0.0);' +
            'border: solid 1px transparent; ' +
            '}' +
            '100%{' +
            'opacity:1; ' +
            'color:#000;' +
            'background-color:rgba(245, 252, 252, 0.8);' +
            '}');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('text-holder-disappear',
            '0%{' +
            'opacity:1; ' +
            'color:#000;' +
            'background-color:rgba(245, 252, 252, 0.8);  ' +
            '}' +
            '100%{' +
            'opacity:0; ' +
            'color:transparent;' +
            'background-color:rgba(245, 252, 252, 0.0);' +
            'border: solid 1px transparent;' +
            '}');


        keyFrames += getStyleSheetMarker() + generateKeyFrame('logo-state-1-animation',
            '0% {  opacity: 1;  } ' +
            '10% {  opacity: 0;  } ' +
            '20% {  opacity: 0;  } ' +
            '30% {  opacity: 0;  } ' +
            '40% {  opacity: 0;  } ' +
            '50% {  opacity: 0;  } ' +
            '60% {  opacity: 0;  } ' +
            '70% {  opacity: 0;  } ' +
            '80% {  opacity: 0;  } ' +
            '90% {  opacity: 0;  } ' +
            '100% {  opacity: 1;  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('logo-state-2-animation',
            '0% {  opacity: 0;  } ' +
            '10% {  opacity: 1;  } ' +
            '20% {  opacity: 0;  } ' +
            '30% {  opacity: 0;  } ' +
            '40% {  opacity: 0;  } ' +
            '50% {  opacity: 0;  } ' +
            '60% {  opacity: 0;  } ' +
            '70% {  opacity: 0;  } ' +
            '80% {  opacity: 0;  } ' +
            '90% {  opacity: 0;  } ' +
            '100% {  opacity: 0;  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('logo-state-3-animation',
            '0% {  opacity: 0;  } ' +
            '10% {  opacity: 0;  } ' +
            '20% {  opacity: 1;  } ' +
            '30% {  opacity: 0;  } ' +
            '40% {  opacity: 0;  } ' +
            '50% {  opacity: 0;  } ' +
            '60% {  opacity: 0;  } ' +
            '70% {  opacity: 0;  } ' +
            '80% {  opacity: 0;  } ' +
            '90% {  opacity: 0;  } ' +
            '100% {  opacity: 0;  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('logo-state-4-animation',
            '0% {  opacity: 0;  } ' +
            '10% {  opacity: 0;  } ' +
            '20% {  opacity: 0;  } ' +
            '30% {  opacity: 1;  } ' +
            '40% {  opacity: 0;  } ' +
            '50% {  opacity: 0;  } ' +
            '60% {  opacity: 0;  } ' +
            '70% {  opacity: 0;  } ' +
            '80% {  opacity: 0;  } ' +
            '90% {  opacity: 0;  } ' +
            '100% {  opacity: 0;  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('logo-state-5-animation',
            '0% {  opacity: 0;  } ' +
            '10% {  opacity: 0;  } ' +
            '20% {  opacity: 0;  } ' +
            '30% {  opacity: 0;  } ' +
            '40% {  opacity: 1;  } ' +
            '50% {  opacity: 0;  } ' +
            '60% {  opacity: 0;  } ' +
            '70% {  opacity: 0;  } ' +
            '80% {  opacity: 0;  } ' +
            '90% {  opacity: 0;  } ' +
            '100% {  opacity: 0;  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('logo-state-6-animation',
            '0% {  opacity: 0;  } ' +
            '10% {  opacity: 0;  } ' +
            '20% {  opacity: 0;  } ' +
            '30% {  opacity: 0;  } ' +
            '40% {  opacity: 0;  } ' +
            '50% {  opacity: 1;  } ' +
            '60% {  opacity: 0;  } ' +
            '70% {  opacity: 0;  } ' +
            '80% {  opacity: 0;  } ' +
            '90% {  opacity: 0;  } ' +
            '100% {  opacity: 0;  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('logo-state-7-animation',
            '0% {  opacity: 0;  } ' +
            '10% {  opacity: 0;  } ' +
            '20% {  opacity: 0;  } ' +
            '30% {  opacity: 0;  } ' +
            '40% {  opacity: 0;  } ' +
            '50% {  opacity: 0;  } ' +
            '60% {  opacity: 1;  } ' +
            '70% {  opacity: 0;  } ' +
            '80% {  opacity: 0;  } ' +
            '90% {  opacity: 0;  } ' +
            '100% {  opacity: 0;  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('logo-state-8-animation',
            '0% {  opacity: 0;  } ' +
            '10% {  opacity: 0;  } ' +
            '20% {  opacity: 0;  } ' +
            '30% {  opacity: 0;  } ' +
            '40% {  opacity: 0;  } ' +
            '50% {  opacity: 0;  } ' +
            '60% {  opacity: 0;  } ' +
            '70% {  opacity: 1;  } ' +
            '80% {  opacity: 0;  } ' +
            '90% {  opacity: 0;  } ' +
            '100% {  opacity: 0;  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('logo-state-9-animation',
            '0% {  opacity: 0;  } ' +
            '10% {  opacity: 0;  } ' +
            '20% {  opacity: 0;  } ' +
            '30% {  opacity: 0;  } ' +
            '40% {  opacity: 0;  } ' +
            '50% {  opacity: 0;  } ' +
            '60% {  opacity: 0;  } ' +
            '70% {  opacity: 0;  } ' +
            '80% {  opacity: 1;  } ' +
            '90% {  opacity: 0;  } ' +
            '100% {  opacity: 0;  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('logo-state-10-animation',
            '0% {  opacity: 0;  } ' +
            '10% {  opacity: 0;  } ' +
            '20% {  opacity: 0;  } ' +
            '30% {  opacity: 0;  } ' +
            '40% {  opacity: 0;  } ' +
            '50% {  opacity: 0;  } ' +
            '60% {  opacity: 0;  } ' +
            '70% {  opacity: 0;  } ' +
            '80% {  opacity: 0;  } ' +
            '90% {  opacity: 1;  } ' +
            '100% {  opacity: 0;  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('disconnected-loader-animation', '0%{  transform: rotate(0deg);  } 100%{  transform: rotate(360deg);  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('oval1-animation', '0%{  transform: rotate(-315deg);  } 50%{  transform: rotate(-495deg);  } 100%{  transform: rotate(-315deg);  }');

        keyFrames += getStyleSheetMarker() + generateKeyFrame('oval2-animation', '0%{  transform: rotate(-45deg);  } 50%{  transform: rotate(-215deg);  } 100%{  transform: rotate(-45deg);  }');


        keyFrames += getStyleSheetMarker() + generateKeyFrame('alan-text-fade-in', '0%{  opacity: 0;  } 100%{   opacity: 1;  }');

        keyFrames += getStyleSheetMarker() + '.alanBtn-bg-default.super-hidden{opacity:0!important;display:none;}';

        var predefinedBtnColorOptions = defaultBtnColorOptions;

        if (btnOptions) {
            if (btnOptions.btnLayerOptions) { //old settings
                predefinedBtnColorOptions = defaultBtnColorOptions;
            } else {
                predefinedBtnColorOptions = btnOptions || defaultBtnColorOptions;
            }
        }

        var btnBackgroundOptionKeys = Object.keys(predefinedBtnColorOptions);
        var tempLayer;
        var stateName;
        var stateMapping = {
            idle: ['default'],
            listen: ['listening'],
            process: ['intermediate', 'understood'],
            reply: ['speaking'],
        };
        var stateNameClasses,stateNameClass;
        var states = Object.keys(stateMapping);
        for (i = 0; i < states.length; i++) {
            stateName = states[i];
            stateNameClasses = stateMapping[stateName];
            tempLayer = predefinedBtnColorOptions[stateName];
            for(var j = 0; j < stateNameClasses.length; j++){
                stateNameClass = stateNameClasses[j];
            if(tempLayer.background){
                keyFrames += getStyleSheetMarker() + '.alanBtn-bg-' + stateNameClass + ' {';
                keyFrames += 'background-image: linear-gradient(122deg,'+tempLayer.background.color[0]+','+tempLayer.background.color[1]+');';
                keyFrames += '}';
                keyFrames += getStyleSheetMarker() + '.alanBtn-oval-bg-' + stateNameClass + ' {';
                keyFrames += 'background-image: linear-gradient(122deg,'+tempLayer.background.color[0]+','+tempLayer.background.color[1]+');';
                keyFrames += '}';
            }

            if(tempLayer.hover){
                keyFrames += getStyleSheetMarker() + '.alanBtn' + hoverSelector + ' .alanBtn-bg-' + stateNameClass + ':not(.super-hidden) {';
                keyFrames += 'background-image: linear-gradient(122deg,'+tempLayer.hover.color[0]+','+tempLayer.hover.color[1]+');';
                keyFrames += '}';
                keyFrames += getStyleSheetMarker() + '.alanBtn:active .alanBtn-bg-' + stateNameClass + ':not(.super-hidden) {';
                keyFrames += 'background-image: linear-gradient(122deg,'+tempLayer.hover.color[0]+','+tempLayer.hover.color[1]+');';
                keyFrames += '}';

                keyFrames += getStyleSheetMarker() + '.alanBtn' + hoverSelector + ' .alanBtn-oval-bg-' + stateNameClass + ':not(.super-hidden) {';
                keyFrames += 'background-image: linear-gradient(122deg,'+tempLayer.hover.color[0]+','+tempLayer.hover.color[1]+');';
                keyFrames += '}';
                keyFrames += getStyleSheetMarker() + '.alanBtn:active .alanBtn-oval-bg-' + stateNameClass + ':not(.super-hidden) {';
                keyFrames += 'background-image: linear-gradient(122deg,'+tempLayer.hover.color[0]+','+tempLayer.hover.color[1]+');';
                keyFrames += '}';
            }
        }

            
        }

        style.innerHTML = keyFrames;

        if (options.shadowDOM) {
            options.shadowDOM.prepend(style);
        } else {
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    }

    function generateKeyFrame(name, rule) {
        var prefixes = ['@-webkit-keyframes', '@keyframes'];
        var r = '';
        for (var i = 0; i < prefixes.length; i++) {
            r += prefixes[i] + ' ' + name + '{' + rule + '} ';
        }
        return r;
    }

    //#endregion

    //#region Connect to the project and add listeners
    if (options) {
        if (options.alanAudio) {
            alanAudio = options.alanAudio;
        }
        if (options.key) {
            currentProjectId = options.key;
            tryReadSettingsFromLocalStorage();
            switchState(getDefaultBtnState(DISCONNECTED));

            window.tutorProject = alan.project(options.key, getAuthData(options.authData), options.host, null, { platform: (mode === 'demo' ? 'alanplayground' : null), appName: window.location.hostname });
            window.tutorProject.on('connectStatus', onConnectStatusChange);
            window.tutorProject.on('options', onOptionsReceived);
            //window.tutorProject.on('popup', onPopup);

            // console.info('BTN: tutorProject', options.key);
        } else {
            switchState(getDefaultBtnState());
        }
    }

    function getAuthData(data) {
        var authData = data || {};
        authData.uuid = getDeviceId();
        return authData;
    }

    function getProjectId() {
        var key;
        if (options.key) {
            key = options.key;
            return key.substr(0, key.indexOf('/'));
        }

        return mode;
    }

    function debounce(func, wait) {
        var timeout;
        var delay = wait || 100;
        return function (args) {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                func.apply(this, args);
            }, delay);
        };
    }

    var onresizeDebounced = debounce(function (e) {
        togglePopupVisibility(true);
    }, 400);

    var windowInitInnerHeight = window.innerHeight;

    function isSafari(){
        return /apple/i.test(navigator.vendor);
    }

    window.onresize = function () {
        var innerHeightDelta = Math.abs(windowInitInnerHeight - window.innerHeight);
        var isMobileIos = isMobile() && isSafari();
        if (btnWasMoved || (isMobileIos && (innerHeightDelta === 84 || innerHeightDelta === 0))) {
            var rootElClientRect = rootEl.getBoundingClientRect();
            if (innerHeightDelta === 0) {
                rootEl.style.setProperty('top', correctYPos(rootElClientRect.top + 84) + 'px', 'important');
            } else {
                rootEl.style.setProperty('top', correctYPos(rootElClientRect.top) + 'px', 'important');
            }
        }
        togglePopupVisibility(false);
        onresizeDebounced();
    };

    function checkPerrmissions() {
        if (navigator.permissions) {
            navigator.permissions.query({ name: 'microphone' }).then(function (result) {
                if (result.state === 'prompt') {
                    if (options.showOverlayOnMicPermissionPrompt) {
                        showPopup({ overlay: true, buttonUnderOverlay: true });
                    }
                    sendClientEvent({ micPermissionPrompt: true });
                }
                if (result.state !== 'granted') {
                    sendClientEvent({ buttonClicked: true,  micAllowed: false});
                } else {
                    sendClientEvent({ buttonClicked: true,  micAllowed: true});
                }
            }).catch(function () {
                console.warn('Not possible to detect mic permissions');
                setTimeout(() => sendClientEvent({ buttonClicked: true,  micAllowed: alanAudio.isMicAllowed()}), 300);
            });
        } else {
            setTimeout(() => sendClientEvent({ buttonClicked: true,  micAllowed: alanAudio.isMicAllowed()}), 300);
        }
    }

    alanAudio.on('popup', onPopup);

    function _activateAlanButton(resolve) {
        //playSoundOn();
        checkPerrmissions();
        if (options.onBeforeMicStart) {
            options.onBeforeMicStart();
        }
        alanAudio.on('micStart', onMicStart);
        alanAudio.on('micStop', onMicStop);
        alanAudio.on('micAllowed', onMicAllowed);
        alanAudio.on('audioRunning', onAudioRunning);
        checkIfPlayAllowed();
        alanAudio.on('micFail', onMicFail);
        alanAudio.on('playStart', onPlayStart);
        alanAudio.on('playStop', onPlayStop);
        alanAudio.on('command', onCommandCbInMicBtn);
        alanAudio.start(resolve);
        if (options.onMicStarted) {
            options.onMicStarted();
        }
    }

    function activateAlanButton() {
        var activatePromise = new Promise(function (resolve, reject) {

            if (btnDisabled) {
                reject({err: BTN_IS_DISABLED_CODE});
                return;
            }

            if (isPreviewMode()) {
                reject({err: PREVIEW_MODE_CODE});
                return;
            }

            function waitForConnectionForActivateCall(res) {
                if (res === 'authorized') {
                    window.tutorProject.off('connectStatus', waitForConnectionForActivateCall);
                    _activateAlanButton(resolve);
                }
            }

            if (alanAudio) {
                switch (state) {
                    case DEFAULT:
                        try {
                            _activateAlanButton(resolve);
                        } catch (e) {
                            currentErrMsg = NO_VOICE_SUPPORT_IN_BROWSER_MSG;
                            reject({ err: NO_VOICE_SUPPORT_IN_BROWSER_CODE });
                        }
                        break;
                    case DISCONNECTED:
                    case OFFLINE:
                        window.tutorProject.on('connectStatus', waitForConnectionForActivateCall);
                        break;
                    case PERMISSION_DENIED:
                        reject({ err: MIC_BLOCKED_CODE });
                        sendClientEvent({ buttonClicked: true,  micAllowed: false});
                        break;
                    case LISTENING:
                    case SPEAKING:
                    case INTERMEDIATE:
                    case UNDERSTOOD:
                        resolve();
                        sendClientEvent({ buttonClicked: true,  micAllowed: true});
                        break;
                    default:
                }
            } else {
                reject({ err: NO_ALAN_AUDIO_INSANCE_WAS_PROVIDED_CODE });
            }
        });

        return activatePromise;
    }

    function checkIfPlayAllowed() {
        if (alanAudio.isAudioRunning()) {
            sendClientEvent({ playAllowed: true });
        }
    }

    function onPopup(p) {
        hidePopup();
        if (isMobile() || isTutorMode()) {
            return;
        }
        if (p) {
            showPopup(p.popup ? p.popup : p);
        }
    }

    function showPopup(popupOptions) {
        savedPopupOptions = popupOptions;
        var message = popupOptions.message;
        var buttonMarginInPopup = popupOptions.buttonMarginInPopup;
        var withOverlay = popupOptions.overlay;
        var _btnSize = parseInt(btnSize, 10);
        var overlay = document.createElement('div');
        var popup = document.createElement('div');
        var rootElClientRect = rootEl.getBoundingClientRect();
        var maxZIndex = 2147483647;
        var popup2BtnMargin = 12;

        popupIsVisible = true;

        overlay.id = 'alan-overlay';
        popup.id = 'alan-overlay-popup';
        overlay.classList.add('alan-overlay');
        popup.classList.add('alan-overlay-popup');

        if (popupOptions.buttonUnderOverlay !== true) {
            btn.style.zIndex = maxZIndex;
        }
        
        overlay.style.zIndex = maxZIndex - 3;
        popup.style.zIndex = maxZIndex - 2;

        if (popupOptions.preventClick) {
            btn.style.pointerEvents = 'none';
        }

        if (popupOptions.style) {
            var popupStyle = document.createElement('style');
            popupStyle.setAttribute('id', 'alan-stylesheet-popup');
            popupStyle.type = 'text/css';
            const parentClass = 'alan-popup-' + guid();
            popup.classList.add(parentClass);
            popupStyle.innerHTML = popupOptions.style.replace(/(\.-?[_a-zA-Z]+[_a-zA-Z0-9-:]*\s*\{)/gi, `.${parentClass} $&`);

            if (options.shadowDOM) {
                options.shadowDOM.prepend(popupStyle);
            } else {
                document.getElementsByTagName('head')[0].appendChild(popupStyle);
            }
        }

        popup.classList.add(isLeftAligned ? 'left' : 'right');

        if (!absolutePosition) {
            if (!isLeftAligned) {
                popup.style.right = initRightPos + (-buttonMarginInPopup || 0) + 'px';
            } else {
                popup.style.left = rootElClientRect.x + (-buttonMarginInPopup || 0) + 'px';
            }

            if (rootElClientRect.top > 80) {
                popup.classList.add('bottom');
                popup.style.top = rootElClientRect.top + (buttonMarginInPopup ? (_btnSize + buttonMarginInPopup) : (-popup2BtnMargin)) + 'px';
                popup.style.setProperty('transform', 'translateY(-100%)', 'important');
            } else {
                popup.classList.add('top');
                popup.style.top = rootElClientRect.top + (buttonMarginInPopup ? (-buttonMarginInPopup) : (_btnSize + popup2BtnMargin)) + 'px';
            }
        } else {
            popup.style.position = 'absolute';
            popup.style[isLeftAligned ? 'left' : 'right'] = (-buttonMarginInPopup || 0) + 'px';
            popup.style[isTopAligned ? 'top' : 'bottom'] = (buttonMarginInPopup ? -buttonMarginInPopup : (_btnSize + popup2BtnMargin)) + 'px';
            popup.classList.add(isTopAligned ? 'top' : 'bottom');
        }

        if (!popupOptions.html) {
            if (message) {
                popup.classList.add('default-popup');
                popup.innerHTML = '<div class="alan-overlay-popup__body">' + message + '</div>';
            }
        } else {
            popup.innerHTML = popupOptions.html;
        }

        var closeIconImg = document.createElement('div');
        closeIconImg.id = 'alan-overlay-ok-btn';
        closeIconImg.classList.add('alan-overlay-popup__ok');
        popup.appendChild(closeIconImg);

        rootEl.appendChild(popup);
        if (withOverlay) {
            rootEl.appendChild(overlay);
        }
        closeIconImg.addEventListener('click', hidePopupByCloseIcon);
        overlay.addEventListener('click', hidePopup);
        document.addEventListener('keyup', hidePopupByEsc);
        let showPopupEvent = "showPopup";
        if (popupOptions.name) {
            showPopupEvent += ":" + popupOptions.name;
        }
        sendUserEvent(showPopupEvent);
    }

    function hidePopupByCloseIcon() {
        hidePopup();
        sendClientEvent({popupCloseClicked: true});
    }

    function hidePopupByEsc(e) {
        if (e.keyCode === 27) {
            hidePopup();
            sendClientEvent({popupCloseClicked: true});
        }
    }

    function hidePopup(keepOptionsInMemory) {
        if (keepOptionsInMemory !== true) {
            savedPopupOptions = null;
        }
        var overlay = rootEl.querySelector('#alan-overlay');
        var popup = rootEl.querySelector('#alan-overlay-popup');
        if (!popup) return;
        var overlayCloseIcon = rootEl.querySelector('#alan-overlay-ok-btn');
        if (overlayCloseIcon) {
            overlayCloseIcon.removeEventListener('click', hidePopup);
        }
        if (overlay) {
            overlay.remove();
            overlay.removeEventListener('click', hidePopup);
        }
        if (popup) {
            popup.remove();
        }
        document.removeEventListener('keyup', hidePopupByEsc);
        btn.style.zIndex = btnZIndex;
        btn.style.pointerEvents = 'auto';
        popupIsVisible = false;
    }

    var savedPopupOptions;

    function togglePopupVisibility(isVisible) {
        var popup = rootEl.querySelector('#alan-overlay-popup');
        if (popup) {
            popup.style.visibility = isVisible ? 'visible' : 'hidden';
            if (isVisible) {
                hidePopup(true);
                if (savedPopupOptions) {
                    showPopup(savedPopupOptions);
                }
            }
        }
    }

    btn.addEventListener('click', function (e) {
        if (afterMouseMove) return;
        if (!dndBackAnimFinished) return;
        hidePopup();
        if (!firstClick) {
            firstClick = true;
            sendClientEvent({ firstClick: true });
        }
        if (currentErrMsg) {
            if (currentErrMsg === MIC_BLOCKED_MSG) {
                sendClientEvent({ buttonClicked: true,  micAllowed: false});
                showAlert(currentErrMsg);
            } else {
                showAlert(currentErrMsg);
            }
            return;
        }
        if (alanAudio) {
            if (state === 'default') {
                coldPlayForSoundNext();
                activateAlanButton();
            } else {
                alanAudio.stop();
            }
        } else {
            throw new Error('No alan audio instance was provided');
        }
        //remove focus state from the btn after click
        this.blur();
    });

    function showRecognisedText(e) {
        var recognisedText = '';

        if (hideS2TPanel || dndIsDown) {
            return;
        }

        recognisedTextVisible = true;
        if (!options.hideRecognizedText) {
            if (recognisedTextHolder.classList.value.indexOf('alanBtn-text-appearing') === -1) {
                recognisedTextHolder.style.opacity = 1;
                recognisedTextHolder.classList.add('with-text');
                recognisedTextHolder.classList.add('alanBtn-text-appearing');
                recognisedTextHolder.classList.remove('alanBtn-text-disappearing');
            }

            if (e.text) {
                recognisedText = e.text;
                if (recognisedText.length > 200) {
                    recognisedText = recognisedText.substr(0, 200);
                }
                recognisedTextContent.innerHTML = recognisedText;
            }

            if (recognisedText.length > 60 && recognisedText.length <= 80) {
                recognisedTextHolder.classList.add('alanBtn-recognised-text-holder-long');
            } else if (recognisedText.length > 80) {
                recognisedTextHolder.classList.add('alanBtn-recognised-text-holder-super-long');
            } else {
                recognisedTextHolder.classList.remove('alanBtn-recognised-text-holder-long');
                recognisedTextHolder.classList.remove('alanBtn-recognised-text-holder-super-long');
            }
           
            replaceRecognisedText(recognisedText);
        }
    }
    
    function replaceRecognisedText(recognisedText) {
        if (isMobile()) {
            return;
        }
        if (!options.hideRecognizedText) {
            recognisedTextContent.innerText = recognisedText;
        }
    }

    function hideRecognisedText(delay, noAnimation) {
        if (!options.hideRecognizedText && recognisedTextVisible) {
            if (noAnimation === true) {
                recognisedTextHolder.style.opacity = 0;
                recognisedTextHolder.classList.remove('alanBtn-text-appearing');
                recognisedTextVisible = false;
                return;
            } else {
                recognisedTextHolder.classList.add('alanBtn-text-disappearing');
                recognisedTextHolder.classList.remove('alanBtn-text-appearing');
            }

            recognisedTextVisible = false;

            setTimeout(function () {
                recognisedTextContent.innerHTML = '';
                recognisedTextHolder.classList.remove('alanBtn-recognised-text-holder-long');
                recognisedTextHolder.classList.remove('alanBtn-recognised-text-holder-super-long');
                recognisedTextHolder.classList.remove('with-text');
            }, delay || 810);
        }
    }

    function onOptionsReceived(data) {
        if (data && data.web) {
            keepButtonPositionAfterDnD = data.web.keepButtonPositionAfterDnD;
            if (!keepButtonPositionAfterDnD) {
                clearSavedBtnPosition();
            }
            setButtonPosition(data.web.keepButtonPositionAfterDnD);
        } else {
            setButtonPosition();
        }

        if (data && data.web && data.web.hideS2TPanel === true) {
            hideSpeach2TextPanel();
        } else {
            showSpeach2TextPanel();
        }

        if (data && data.web && data.web.timeout !== undefined ) {
            turnOffTimeout = data.web.timeout;
            setTurnOffVoiceTimeout();
        }

        if (data && data.web) {
            applyBtnOptions(data.web.btnOptions);
        }

        console.info('OPTIONS', data.web);
        applyLogoOptions(data);

        if (options.mode !== 'tutor') {
            if (data && data.web) {
                applyBtnSizeOptions(data.web.buttonSize || btnModes[mode].btnSize);
            }
        }

        if (isLocalStorageAvailable && data) {
            localStorage.setItem(getStorageKey(), JSON.stringify(data));
        }

        if (data && data.web && data.web.playReadyToListenSound !== undefined) {
            applyPlayReadyToListenSoundOptions(data.web.playReadyToListenSound);
        }

        if (data && data.web && data.web.hidden === true) {
            hideAlanBtn();
        } else {
            // sendClientEvent({ buttonReady: true });
            showAlanBtn();
        }
    }

    function onConnectStatusChange(res) {
        console.info('BTN: connectStatus', res);

        if (options.onConnectionStatus) {
            options.onConnectionStatus(res);
        }

        if (res === 'disconnected') {
            if (previousState !== OFFLINE) {
                switchState(getDefaultBtnState(DISCONNECTED));
            }
        } else if (res === 'authorized') {
            if (previousState) {
                switchState(previousState);
            } else {
                switchState(getDefaultBtnState());
            }
        }
    }

    function onMicAllowed() {
        sendClientEvent({ micAllowed: true });
    }

    function onAudioRunning() {
        checkIfPlayAllowed();
    }

    function onMicStart() {
        // console.log('BTN: mic. started', new Date());
        if (micWasStoppedByTimeout) {
            micWasStoppedByTimeout = false;
            alanAudio.start();
            return;
        }

        hidePopup();
        switchState(LISTENING);
        playSoundNext();
        isAlanActive = true;

        if (window.tutorProject) {
            window.tutorProject.on('text', onTextCbInMicBtn);
            window.tutorProject.on('parsed', onParsedCbInMicBtn);
            window.tutorProject.on('recognized', onRecognizedCbInMicBtn);
            window.tutorProject.on('connectStatus', onConnectStatusChange);
            window.tutorProject.on('options', onOptionsReceived);
        }
    }

    function onMicStop() {
        // console.log('BTN: mic. stopped');
        playSoundOff();
        isAlanSpeaking = false;

        alanAudio.off('micStart', onMicStart);
        alanAudio.off('micStop', onMicStop);
        alanAudio.off('micAllowed', onMicAllowed);
        alanAudio.off('audioRunning', onAudioRunning);
        alanAudio.off('micFail', onMicFail);
        alanAudio.off('playStart', onPlayStart);
        alanAudio.off('playStop', onPlayStop);
        alanAudio.off('command', onCommandCbInMicBtn);
        //alanAudio.off('popup', onPopup);
        hideRecognisedText();

        switchState(DEFAULT);

        isAlanActive = false;

        if (window.tutorProject) {
            window.tutorProject.off('text', onTextCbInMicBtn);
            window.tutorProject.off('parsed', onParsedCbInMicBtn);
            window.tutorProject.off('recognized', onRecognizedCbInMicBtn);
            window.tutorProject.off('connectStatus', onConnectStatusChange);
            window.tutorProject.off('options', onOptionsReceived);
        }

        if (options.onMicStopped) {
            options.onMicStopped();
        }
    }

    function onMicFail(err) {
        // console.log('BTN: mic. failed');
        onMicStop();

        if (err) {
            hidePopup();
            if (err.name === 'NotAllowedError') {
                switchState(PERMISSION_DENIED);
                // setTimeout(function () { if(firstClick){showAlert(MIC_BLOCKED_MSG);} }, 300);
            } else if(err.name === 'SecurityError') {
                switchState(NOT_SECURE_ORIGIN);
                setTimeout(function () { showAlert(NOT_SECURE_ORIGIN_MSG); }, 300);
            } else {
                console.error(err.name + ' ' + err.message);
            }
        }
    }

    function showAlert(msg){
        var alertPopup = rootEl.querySelector('#alan-alert-popup');
        if (alertPopup) return;
        var overlay = document.createElement('div');
        alertPopup = document.createElement('div');
        var maxZIndex = 2147483647;

        overlay.id = 'alan-overlay-for-alert';
        overlay.classList.add('alan-overlay-for-alert');
        alertPopup.id = 'alan-alert-popup';
        alertPopup.classList.add('alan-alert-popup');

        btn.style.zIndex = maxZIndex;
        overlay.style.zIndex = maxZIndex - 3;
        alertPopup.style.zIndex = maxZIndex - 2;
        alertPopup.innerHTML = msg;

        var closeIconImg = document.createElement('div');
        closeIconImg.id = 'alan-alert-popup-close-btn';
        closeIconImg.classList.add('alan-alert-popup__close-btn');
        alertPopup.appendChild(closeIconImg);

        rootEl.appendChild(alertPopup);
        rootEl.appendChild(overlay);

        closeIconImg.addEventListener('click', hideAlert);
        overlay.addEventListener('click', hideAlert);
        document.addEventListener('keyup', hideAlertByEsc);
    }

    function hideAlertByEsc(e) {
        if (e.keyCode === 27) {
            hideAlert();
        }
    }

    function hideAlert() {
        var overlay = rootEl.querySelector('#alan-overlay-for-alert');
        var alertPopup = rootEl.querySelector('#alan-alert-popup');
        var overlayCloseIcon = rootEl.querySelector('#alan-alert-popup-close-btn');
        if (overlayCloseIcon) {
            overlayCloseIcon.removeEventListener('click', hidePopup);
        }
        if (overlay) {
            overlay.remove();
            overlay.removeEventListener('click', hidePopup);
        }
        if (alertPopup) {
            alertPopup.remove();
        }
        btn.style.zIndex = btnZIndex;
        btn.style.pointerEvents = 'auto';
        document.removeEventListener('keyup', hideAlertByEsc);
    }

    function onPlayStart(e) {
        console.log('BTN: play start');
        isAlanSpeaking = true;
        switchState(SPEAKING);
        turnOffVoiceFn();
    }

    function onPlayStop(e) {
        console.log('BTN: play stop');
        isAlanSpeaking = false;
        playSoundNext();
        switchState(LISTENING);
        turnOffVoiceFn();
    }

    function onTextCbInMicBtn(e) {
        // console.info('BTN: onTextCb', e, new Date());
        if (options.onEvent) {
            options.onEvent(Object.assign(e, { name: 'text' }));
        }
        turnOffVoiceFn();
    }

    function onParsedCbInMicBtn(e) {
        // console.info('BTN: onParsedCb', e, new Date());
        if (options.onEvent) {
            options.onEvent(Object.assign(e, { name: 'parsed' }));
        }
        turnOffVoiceFn();
        showRecognisedText(e);
    }

    function onRecognizedCbInMicBtn(e) {
        // console.info('BTN: onRecognizedTextCb', e, new Date());
        if (options.onEvent) {
            options.onEvent(Object.assign(e, { name: 'recognized' }));
        }

        if (e.final === true) {
            switchState(UNDERSTOOD);
        } else {
            switchState(INTERMEDIATE);
        }

        showRecognisedText(e);
        turnOffVoiceFn();
    }

    function onCommandCbInMicBtn(e) {
        // console.info('BTN: onCommandCbInMicBtn', e, new Date());
        if (options.onCommand) {
            options.onCommand(e.data);
        }
        switchState(LISTENING);
        turnOffVoiceFn();
    }

    function playSoundOn() {
        if (!soundOnAudioDoesNotExist) {
            soundOnAudio.currentTime = 0;
            soundOnAudio.play().catch(function () {
                console.log("No activation sound, because the user didn't interact with the button");
            });
        }
    }

    function playSoundOff() {
        if (!soundOffAudioDoesNotExist) {
            soundOffAudio.currentTime = 0;
            soundOffAudio.play().catch(function () {
                console.log("No deactivation sound, because the user didn't interact with the button");
            });
        }
    }

    function coldPlayForSoundNext() {
        if (!playReadyToListenSound) return;
        soundNextAudio.loop = true;
        soundNextAudio.muted = true;
        soundNextAudio.play().catch(function (err) { console.log(err); });
    }

    function playSoundNext() {
        soundNextColdPlay = false;
        if (!playReadyToListenSound) return;
        alanAudio.skipExternalSounds(true);
        if (!soundNextAudioDoesNotExist) {
            soundNextAudio.currentTime = 0;
            soundNextAudio.muted = false;
            soundNextAudio.loop = false;
            soundNextAudio.play().catch(function (err) { console.log(err); });
        }
    }

    function changeCustomLogoVisibility(visibleLogo, logosToHide) {
        if (visibleLogo && visibleLogo.src) {
            visibleLogo.style.opacity = 1;
        }

        for (var i = 0; i < logosToHide.length; i++) {
            logosToHide[i].style.opacity = 0;
        }
    }

    window.switchState = switchState;

    function switchState(newState) {

        if (options.onButtonState) {
            options.onButtonState(btnStateMapping[newState]);
        }

        console.info('BTN: state', newState);
        
        var tempLogoParts = [],
            i = 0;

        if (newState !== DISCONNECTED) {
            previousState = newState;
        }

        currentErrMsg = null;

        if (newState === DEFAULT) {
            btn.style.animation = '';
            micIconDiv.style.animation = '';
            roundedTriangleIconDiv.style.animation = '';
            btnBgDefault.classList.remove('super-hidden');
            btnBgDefault.style.opacity = onOpacity;
            btnOval1.style.animation = '';
            btnOval2.style.animation = '';
            btnOval1.style.opacity = 0;
            btnOval2.style.opacity = 0;
            changeBgColors(DEFAULT);

            micIconDiv.style.opacity = 1;
            roundedTriangleIconDiv.style.opacity = 0;

            changeCustomLogoVisibility(
                defaultStateBtnIconImg,
                [
                    listenStateBtnIconImg,
                    processStateBtnIconImg,
                    replyStateBtnIconImg
                ]
            );

            hideLayers([
                btnBgListening,
                btnBgSpeaking,
                btnBgIntermediate,
                btnBgUnderstood,
            ]);
        } else if (newState === LISTENING) {
            btn.style.animation = pulsatingAnimation;
            micIconDiv.style.animation = pulsatingMicAnimation;

            btnBgListening.classList.remove('super-hidden');
            btnBgListening.style.opacity = onOpacity;

            btnOval1.style.opacity = 1;
            btnOval2.style.opacity = 1;

            changeBgColors(LISTENING);

            micIconDiv.style.opacity = 1;

            if (!listenStateBtnIconImg.src) {
                roundedTriangleIconDiv.style.animation = pulsatingTriangleMicAnimation;
                roundedTriangleIconDiv.style.opacity = 1;
            }

            changeCustomLogoVisibility(
                listenStateBtnIconImg,
                [
                    defaultStateBtnIconImg,
                    processStateBtnIconImg,
                    replyStateBtnIconImg
                ]
            );

            hideLayers([
                btnBgSpeaking,
                btnBgIntermediate,
                btnBgUnderstood,
            ]);
        } else if (newState === SPEAKING) {
            hideRecognisedText();
            btn.style.animation = pulsatingAnimation;

            btnBgSpeaking.classList.remove('super-hidden');
            btnBgSpeaking.style.opacity = onOpacity;
            btnOval1.style.opacity = 1;
            btnOval2.style.opacity = 1;
            changeBgColors(SPEAKING);

            changeCustomLogoVisibility(
                replyStateBtnIconImg,
                [
                    defaultStateBtnIconImg,
                    listenStateBtnIconImg,
                    processStateBtnIconImg
                ]
            );

            hideLayers([
                btnBgDefault,
                btnBgListening,
                btnBgIntermediate,
                btnBgUnderstood,
            ]);
        } else if (newState === INTERMEDIATE) {
            btn.style.animation = pulsatingAnimation;

            btnBgIntermediate.classList.remove('super-hidden');
            btnBgIntermediate.style.opacity = onOpacity;
            btnOval1.style.opacity = 1;
            btnOval2.style.opacity = 1;
            changeBgColors(INTERMEDIATE);
            micIconDiv.style.opacity = 1;
            if (!processStateBtnIconImg.src) {
                console.info('roundedTriangleIconDiv.style.opacity = 1');
                roundedTriangleIconDiv.style.opacity = 1;
            }

            hideLayers([
                btnBgDefault,
                btnBgListening,
                btnBgSpeaking,
                btnBgUnderstood,

            ]);

            changeCustomLogoVisibility(
                processStateBtnIconImg,
                [
                    defaultStateBtnIconImg,
                    listenStateBtnIconImg,
                    replyStateBtnIconImg
                ]
            );

        } else if (newState === UNDERSTOOD) {
            btn.style.animation = pulsatingAnimation;

            btnBgUnderstood.classList.remove('super-hidden');
            btnBgUnderstood.style.opacity = onOpacity;
            btnOval1.style.opacity = 1;
            btnOval2.style.opacity = 1;
            changeBgColors(UNDERSTOOD);

            micIconDiv.style.opacity = 1;
            if (!processStateBtnIconImg.src) {
                console.info('roundedTriangleIconDiv.style.opacity = 1');
                roundedTriangleIconDiv.style.opacity = 1;
            } else {
                roundedTriangleIconDiv.style.opacity = 0;
            }

            changeCustomLogoVisibility(
                processStateBtnIconImg,
                [
                    defaultStateBtnIconImg,
                    listenStateBtnIconImg,
                    replyStateBtnIconImg
                ]
            );

            hideLayers([
                btnBgDefault,
                btnBgListening,
                btnBgSpeaking,
                btnBgIntermediate,
            ]);
        }

        if (newState === SPEAKING) {
            roundedTriangleIconDiv.style.opacity = 0;
            roundedTriangleIconDiv.style.backgroundSize = '0% 0%';
            if (!replyStateBtnIconImg.src) {
                circleIconDiv.style.opacity = 1;
                circleIconDiv.style.backgroundSize = '100% 100%';
            }
        } else {
            circleIconDiv.style.opacity = 0;
            circleIconDiv.style.backgroundSize = '0% 0%';
            roundedTriangleIconDiv.style.backgroundSize = '100% 100%';
        }

        if (newState === DEFAULT) {
            roundedTriangleIconDiv.classList.add('triangleMicIconBg-default');
        } else {
            roundedTriangleIconDiv.classList.remove('triangleMicIconBg-default');
        }

        tempLogoParts = [
            logoState1,
            logoState2,
            logoState3,
            logoState4,
            logoState5,
            logoState6,
            logoState7,
            logoState8,
            logoState9,
            logoState10
        ];

        if ((newState === LISTENING && !listenStateBtnIconImg.src) ||
            (newState === INTERMEDIATE && !processStateBtnIconImg.src) ||
            (newState === SPEAKING && !replyStateBtnIconImg.src) ||
            (newState === UNDERSTOOD && !processStateBtnIconImg.src)) {

            if (logoState1.style.animationName === '') {
                for (i = 0; i < tempLogoParts.length; i++) {
                    if (i === 0) {
                        tempLogoParts[i].style.opacity = 1;
                    } else {
                        tempLogoParts[i].style.opacity = 0;
                    }
                    tempLogoParts[i].style.animationName = 'logo-state-' + (i + 1) + '-animation';
                }
            }
            defaultStateBtnIconImg.style.opacity = 0;
        } else {
            //defaultStateBtnIconImg.style.opacity = 1;
            for (i = 0; i < tempLogoParts.length; i++) {
                tempLogoParts[i].style.opacity = 0;
                tempLogoParts[i].style.animationName = '';
            }
        }

        if (newState === LOW_VOLUME || newState === PERMISSION_DENIED || newState === NO_VOICE_SUPPORT || newState === NOT_SECURE_ORIGIN) {
            if (newState === LOW_VOLUME) {
                rootEl.classList.add("alan-btn-low-volume");
                currentErrMsg = LOW_VOLUME_MSG;
            } else if (newState === PERMISSION_DENIED) {
                rootEl.classList.add("alan-btn-permission-denied");
                currentErrMsg = MIC_BLOCKED_MSG;
            } else if (newState === NO_VOICE_SUPPORT || newState === NOT_SECURE_ORIGIN) {
                rootEl.classList.add("alan-btn-no-voice-support");
                if (newState === NO_VOICE_SUPPORT) {
                    currentErrMsg = NO_VOICE_SUPPORT_IN_BROWSER_MSG;
                } else if (newState === NOT_SECURE_ORIGIN) {
                    currentErrMsg = NOT_SECURE_ORIGIN_MSG;
                }
            }

            if (newState === NO_VOICE_SUPPORT) {
                noVoiceSupportMicIconImg.style.opacity = 1;
                lowVolumeMicIconImg.style.opacity = 0;
            } else {
                noVoiceSupportMicIconImg.style.opacity = 0;
                lowVolumeMicIconImg.style.opacity = 1;
            }

            changeCustomLogoVisibility(
                null,
                [
                    defaultStateBtnIconImg,
                    listenStateBtnIconImg,
                    processStateBtnIconImg,
                    replyStateBtnIconImg
                ]
            );

            micIconDiv.style.opacity = 0;
            roundedTriangleIconDiv.style.opacity = 0;
            disconnectedMicLoaderIconImg.style.opacity = 0;
            offlineIconImg.style.opacity = 0;
            btnOval1.style.animation = '';
            btnOval2.style.animation = '';
            btnOval1.style.opacity = 0;
            btnOval2.style.opacity = 0;
        } else if (newState === DISCONNECTED || newState === OFFLINE ) {
            if (newState === DISCONNECTED) {
                rootEl.classList.add("alan-btn-disconnected");
            }
            if (newState === OFFLINE) {
                rootEl.classList.add("alan-btn-offline");
                currentErrMsg = OFFLINE_MSG;
            }
            roundedTriangleIconDiv.style.opacity = 0;
            lowVolumeMicIconImg.style.opacity = 0;
            btnOval1.style.animation = '';
            btnOval2.style.animation = '';
            btnOval1.style.opacity = 0;
            btnOval2.style.opacity = 0;

            changeCustomLogoVisibility(
                null,
                [
                    defaultStateBtnIconImg,
                    listenStateBtnIconImg,
                    processStateBtnIconImg,
                    replyStateBtnIconImg
                ]);

            if (newState === DISCONNECTED) {
                micIconDiv.style.opacity = 0;
                disconnectedMicLoaderIconImg.style.opacity = 1;
            } else {
                micIconDiv.style.opacity = 0;
                disconnectedMicLoaderIconImg.style.opacity = 0;
                offlineIconImg.style.opacity = 1;
            }
        } else {
            lowVolumeMicIconImg.style.opacity = 0;
            offlineIconImg.style.opacity = 0;
            disconnectedMicLoaderIconImg.style.opacity = 0;
            rootEl.classList.remove("alan-btn-low-volume");
            rootEl.classList.remove("alan-btn-permission-denied");
            rootEl.classList.remove("alan-btn-disconnected");
            rootEl.classList.remove("alan-btn-offline");
            rootEl.classList.remove("alan-btn-no-voice-support");
        }

        state = newState;
    }

    //#endregion

    //#region Helpers
    function applyBgStyles(el, backgroundImage) {
        el.style.transition = 'all 0.4s linear';
        el.style.position = 'absolute';
        el.style.top = '0px';
        el.style.left = '0px';
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.borderRadius = '50%';
        el.style.zIndex = btnBgLayerZIndex;
        el.style.backgroundPosition = '0 0';
        el.style.opacity = 0;
        el.style.opacity = 0;
        el.style.transition = 'opacity 300ms ease-in-out';
        el.style.animation = gradientAnimation;
    }

    function hideLayers(layers) {
        for (var i = 0; i < layers.length; i++) {
            layers[i].style.opacity = offOpacity;
            layers[i].classList.add('super-hidden');
        }
    }

    function changeBgColors(state) {
        var tempBgLayers = [btnOval1, btnOval2];
        var newStateName = state || DEFAULT;
        var tempBgLayerClasses = [
            'alanBtn-oval-bg-' + DEFAULT,
            'alanBtn-oval-bg-' + LISTENING,
            'alanBtn-oval-bg-' + INTERMEDIATE,
            'alanBtn-oval-bg-' + UNDERSTOOD,
            'alanBtn-oval-bg-' + SPEAKING,
        ];

        for (var i = 0; i < tempBgLayers.length; i++) {
            tempBgLayers[i].classList.add('alanBtn-oval-bg-' + newStateName);
            for (var j = 0; j < tempBgLayerClasses.length; j++) {
                tempBgLayers[i].classList.remove(tempBgLayerClasses[j]);
            }
        }
    }

    function getStorageKey() {
        var key = '';
        if (options && options.key) {
            key = options.key;
        }
        return 'alan-btn-options-' + key;
    }

    function isMobile() {
        if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        }
        return false;
    }

    function isOriginSecure() {
        var isSecure = false;
        var protocol = window.location.protocol;
        var hostname = window.location.hostname;

        if (protocol === 'https:') {
            isSecure = true;
        }

        if (protocol === 'file:') {
            isSecure = true;
        }

        if (protocol === 'http:' && (hostname.indexOf('localhost') > -1 || hostname.indexOf('127.0.0.1') > -1)) {
            isSecure = true;
        }

        return isSecure;
    }

    function isAudioSupported() {
        var available = false,
            fakeGetUserMedia,
            fakeContext;

        fakeGetUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia ||
            (navigator.mediaDevices && navigator.mediaDevices.getUserMedia));

        fakeContext = window.AudioContext ||
            window.webkitAudioContext ||
            window.mozAudioContext;

        if (fakeGetUserMedia && fakeContext) {
            available = true;
        }

        return available;
    }

    //#endregion

    //#region Append layers to the rootEl
    function showAlanBtn() {
        rootEl.innerHTML = '';

        recognisedTextHolder.appendChild(recognisedTextContent);

        rootEl.appendChild(recognisedTextHolder);
        rootEl.appendChild(btn);
        btnDisabled = false;
        sendClientEvent({ buttonReady: true });
    }

    function hideAlanBtn() {
        if (!isTutorMode()) {
            alanAudio.stop();
            rootEl.innerHTML = '';
            btnDisabled = true;
        }
    }

    function showSpeach2TextPanel() {
        hideS2TPanel = false;
    }

    function hideSpeach2TextPanel() {
        hideS2TPanel = true;
        hideRecognisedText();
    }

    function applyBtnOptions(btnOptions) {
        if (btnOptions) {
            createAlanStyleSheet(btnOptions);
        } else {
            createAlanStyleSheet();
        }
    }

    function applyLogoOptions(data) {
        if (data && data.web) {
            // support prev version of the Alan Btn where we can customize logo via only one prop - logoUrl
            if (data.web.logoUrl &&
                !data.web.logoIdle &&
                !data.web.logoListen &&
                !data.web.logoProcess &&
                !data.web.logoReply) {
                listenStateBtnIconImg.src = data.web.logoUrl;
                processStateBtnIconImg.src = data.web.logoUrl;
                replyStateBtnIconImg.src = data.web.logoUrl;
            } else {
                if (data.web.logoIdle) {
                    defaultStateBtnIconImg.src = data.web.logoIdle;
                } else {
                    defaultStateBtnIconImg.src = micIconSrc;
                }

                if (data.web.logoListen) {
                    listenStateBtnIconImg.src = data.web.logoListen;
                } else {
                    listenStateBtnIconImg.removeAttribute('src');
                    listenStateBtnIconImg.style.opacity = 0;
                }

                if (data.web.logoProcess) {
                    processStateBtnIconImg.src = data.web.logoProcess;
                } else {
                    processStateBtnIconImg.removeAttribute('src');
                    processStateBtnIconImg.style.opacity = 0;
                }

                if (data.web.logoReply) {
                    replyStateBtnIconImg.src = data.web.logoReply;
                } else {
                    replyStateBtnIconImg.removeAttribute('src');
                    replyStateBtnIconImg.style.opacity = 0;
                }
            }
        }
    }

    function applyPlayReadyToListenSoundOptions(playSound){
        playReadyToListenSound = playSound;
    }

    rootEl.classList.add("alanBtn-root");
    rootEl.classList.add("alan-" + getProjectId());

    var alanBtnSavedOptions = null;

    if (isTutorMode()) {
        showAlanBtn();
    } else {
        if (isLocalStorageAvailable) {
            try {
                tryReadSettingsFromLocalStorage();
            } catch (e) {
            }
        }
    }

    function tryReadSettingsFromLocalStorage() {
        if (isLocalStorageAvailable) {
            try {
                alanBtnSavedOptions = JSON.parse(localStorage.getItem(getStorageKey()));

                if (alanBtnSavedOptions && alanBtnSavedOptions.web) {

                    if (alanBtnSavedOptions.web.btnOptions) {
                        applyBtnOptions(alanBtnSavedOptions.web.btnOptions);
                    }
                }
            } catch (e) {

            }
        }
    }

    if (!options.rootEl) {
        body.appendChild(rootEl);
    }

    //#endregion

    //#region Drag-n-drop btn logic

    if (!pinned) {
        rootEl.addEventListener('mousedown', onMouseDown, true);
        rootEl.addEventListener('touchstart', onMouseDown, { passive: false });

        document.addEventListener('mouseup', onMouseUp, true);
        document.addEventListener('touchend', onMouseUp, { passive: false });

        document.addEventListener('mousemove', onMouseMove, true);
        document.addEventListener('touchmove', onMouseMove, { passive: false });
    }

    function onMouseDown(e) {
        var posInfo = e.touches ? e.touches[0] : e,
            rootElClientRect;
        if (!posInfo) return;
        if (!dndBackAnimFinished || (e.buttons !== undefined && e.buttons !== 1)) return;
        dndIsDown = true;
        rootEl.style.transition = '0ms';

        rootElClientRect = rootEl.getBoundingClientRect();

        if (rootElClientRect) {
            var rootElPosX = rootElClientRect.x;

            if (!dndFinalHorPos) {
                dndFinalHorPos = isLeftAligned ? rootElPosX : window.innerWidth - rootElPosX - btnSize - (window.innerWidth - document.documentElement.clientWidth);
            }

            dndBtnLeftPos = rootElPosX;
            rootEl.style.setProperty('left', rootElPosX + 'px', 'important');
            rootEl.style.setProperty('right', 'auto', 'important');

            dndInitMousePos = [
                posInfo.clientX,
                posInfo.clientY
            ];

            dndBtnTopPos = parseInt(rootElClientRect.top, 10);

            rootEl.style.setProperty('top', dndBtnTopPos + 'px', 'important');
            rootEl.style.setProperty('bottom', 'auto', 'important');
        }
    }

    function onMouseMove(e) {
        var posInfo = e.touches ? e.touches[0] : e;
        var newLeftPos, newTopPos;
        if (!posInfo) return;

        if (dndIsDown) {
            togglePopupVisibility(false);
            hideRecognisedText(0, true);
            e.preventDefault();
            afterMouseMove = true;

            newLeftPos = dndBtnLeftPos + posInfo.clientX - dndInitMousePos[0];
            newTopPos = dndBtnTopPos + posInfo.clientY - dndInitMousePos[1];
            tempDeltaX = posInfo.clientX - dndInitMousePos[0];
            tempDeltaY = posInfo.clientY - dndInitMousePos[1];
            rootEl.style.setProperty('left', correctXPos(newLeftPos) + 'px', 'important');
            rootEl.style.setProperty('top', correctYPos(newTopPos) + 'px', 'important');
            e.preventDefault();
            return false;
        }
        
    }

    function onMouseUp(e) {
        var curX, curY;
        var posInfo;
        if (dndIsDown) {
            posInfo = e.changedTouches ? e.changedTouches[0] : e;
            if (!posInfo) return;
            dndIsDown = false;
            rootEl.style.transition = dndAnimTransition;
            curX = parseInt(rootEl.style.left, 10);
            curY = parseInt(rootEl.style.top, 10);

            if (curX <= window.innerWidth / 2) {
                rootEl.style.setProperty('left', dndFinalHorPos + 'px', 'important');
                changeBtnSide('to-left');
                isLeftAligned = true;
                isRightAligned = false;
                setTextPanelPosition(recognisedTextHolder, curY);
                btnWasMoved = true;
                setTimeout(function () {
                    togglePopupVisibility(true);
                    saveBtnPosition('left', dndFinalHorPos, curY);
                }, dndAnimDelay);
            } else {
                rootEl.style.setProperty('left', window.innerWidth - dndFinalHorPos - btnSize - (window.innerWidth - document.documentElement.clientWidth) + 'px', 'important');
                setTimeout(function () {
                    rootEl.style.setProperty('right', dndFinalHorPos + 'px', 'important');
                    changeBtnSide('to-right');
                    isLeftAligned = false;
                    isRightAligned = true;
                    setTextPanelPosition(recognisedTextHolder, curY);
                    saveBtnPosition('right', dndFinalHorPos, curY);
                    btnWasMoved = true;
                    dndBackAnimFinished = true;
                    togglePopupVisibility(true);
                }, dndAnimDelay);
            }

            setTimeout(function () {
                afterMouseMove = false;
            }, 300);

            if (Math.abs(tempDeltaX) < 15 && Math.abs(tempDeltaY) < 15) {
                afterMouseMove = false;
                dndBackAnimFinished = true;
            }
        }
    }

    function correctYPos(yPos) {
        var defDelta = 10;
        if (yPos < defDelta) {
            return defDelta;
        } else {
            if (yPos > window.innerHeight - btnSize - defDelta) {
                return window.innerHeight - btnSize - defDelta;
            }
        }
        return yPos;
    }

    function correctXPos(xPos) {
        var defDelta = 10;
        if (xPos < defDelta) {
            return defDelta;
        } else if (xPos > window.innerWidth - btnSize - defDelta) {
            return window.innerWidth - btnSize - defDelta;
        }
        return xPos;
    }

    function changeBtnSide(side) {
        if (side === 'to-left') {
            rootEl.style.setProperty('right', 'auto', 'important');
        } else {
            rootEl.style.setProperty('left', 'auto', 'important');
        }
        setStylesBasedOnSide();
    }

    function saveBtnPosition(orientation, x, y) {
        if (!keepButtonPositionAfterDnD) return;
        if (isSessionStorageAvailable) {
            var projectId = getProjectId();
            sessionStorage.setItem('alan-btn-saved-orientation-' + projectId, orientation);
            sessionStorage.setItem('alan-btn-saved-x-pos-' + projectId, Math.floor(x));
            sessionStorage.setItem('alan-btn-saved-y-pos-' + projectId, Math.floor(y));
        }
    }

    function clearSavedBtnPosition() {
        if (isSessionStorageAvailable) {
            var projectId = getProjectId();
            sessionStorage.removeItem('alan-btn-saved-orientation-' + projectId);
            sessionStorage.removeItem('alan-btn-saved-x-pos-' + projectId);
            sessionStorage.removeItem('alan-btn-saved-y-pos-' + projectId);
        }
    }


    function getSavedBtnPosition() {
        if (isSessionStorageAvailable) {
            var projectId = getProjectId();
            var savedOptions = {
                orientation: sessionStorage.getItem('alan-btn-saved-orientation-' + projectId),
                x: +sessionStorage.getItem('alan-btn-saved-x-pos-' + projectId),
                y: +sessionStorage.getItem('alan-btn-saved-y-pos-' + projectId),
            };

            if (savedOptions.orientation) {
                return savedOptions;
            }

            return null;
        }
        return null;
    }

    //#endregion

    return btnInstance;
}
ns.alanBtn = alanBtn;
ns.alanBtn.getDebugInfo = getDebugInfo;

})(window);

return alanBtn;
}));