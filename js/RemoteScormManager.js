delete(window.API);
delete(window.API_1484_11);
class RemoteScormManager {
    constructor(options) {
        let that = this;
        that.options = typeof options == `undefined` ? {} : options;
        that.pm = new PostMessageManager(that.options);
        that.cmi = {};
        that.mode = that.pm.mode;
        that.apiVersion = '1.2';
        that.timestart = new Date().getTime();
        that.events = {
            ready: `RSCO_EVT_READY_${ that.mode ? 'MASTER' : 'SLAVE'}`
        }
        that.init();
        return that;
    }
    init() {
        let that = this;
        if (that.mode) {
            that.initMaster();
        } else {
            that.initSlave();
        }
        that.pm.onReadMessage((data) => {
            that.onRemoteAction(data);
        });
        return that;
    }
    initMaster() {
        console.log('INIT MASTER!');
        let that = this;
        that.loadScormAPI();
        if (that.options.html) {
            console.log('HTML MODE ON!');
            that.Initialize();
            that.GetValue('cmi.core.lesson_mode');
            that.GetLastError();
            that.GetValue('cmi.core.lesson_mode');
            that.GetLastError();
            that.GetValue('cmi.core.lesson_status');
            that.GetLastError();
            that.SetValue('cmi.core.exit', 'suspend');
            that.GetValue('cmi.core.entry');
            that.GetLastError();
            that.GetValue('cmi.core.lesson_location');
            that.GetLastError();
            that.GetValue('cmi.suspend_data');
            that.GetLastError();
            that.GetValue('cmi.core.student_name');
            that.GetLastError();
            that.fakeScorm();
        }
        that.options.target.addEventListener('load', () => {
            that.remoteAction('MasterReady', {});
            window.dispatchEvent(new Event(that.events.ready));
        });
        that.options.target.src = that.options.url;
        return that;
    }
    initSlave() {
        console.log('INIT SLAVE!');
        let that = this;
        that.api = that;
        window.API = that;
        window.API_1484_11 = that;
        that.options.target.addEventListener('load', () => {
            window.dispatchEvent(new Event(that.events.ready));
        });
        return that;
    }
    loadScormAPI() {
        let that = this,
            win = window,
            limit = 10,
            trys = 0,
            api = null;
        while (typeof win != null && api == null && trys < limit) {
            trys++;
            if (win.API != null) {
                api = win.API;
            } else if (win.API_1484_11 != null) {
                api = win.API_1484_11;
            } else {
                win = win.parent;
            }
        }
        that.api = api;
        return that;
    }
    onReady(cb) {
        let that = this;
        window.addEventListener(that.events.ready, () => {
            window.RSCO = that;
            cb(that);
        });
        return that;
    }

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    remoteAction(action, data) {
        let that = this;
        if (!that.mode) {
            //console.log(action);
        }
        that.pm.sendMessage({
            id: that.uuidv4(),
            action: action,
            data: data
        });
        return that;
    }

    loadFromJson(json, element) {
        let that = this;
        element = element || "cmi";
        for (var key in json) {
            if (json.hasOwnProperty(key) && json[key]) {
                let celement = `${element}.${key}`,
                    val = json[key];
                if (val.childArray) {
                    for (let i = 0; i < val.childArray.length; i++) {
                        that.loadFromJson(val.childArray[i], `${celement}.${i}`);
                    }
                } else if (val.constructor === Object) {
                    that.loadFromJson(val, celement);
                } else {
                    that.SetValue(celement, val);
                }
            }
        }
        return that;
    }

    onRemoteAction(action) {
        let that = this;
        if (typeof action.action !== 'undefined') {
            //console.log((that.mode ? 'MASTER' : 'SLAVE') + ': ' + action.action);
            switch (action.action) {
                case 'UpdateRemote':
                    break;
                case 'MasterReady':
                    that.options.target.src = 'index_scorm.html';
                    break;
                case 'Initialize':
                    that.Initialize();
                    break;
                case 'Terminate':
                    that.Terminate();
                    break;
                case 'GetValue':
                    that.GetValue(action.data.param);
                    break;
                case 'SetValue':
                    that.SetValue(action.data.param, action.data.value);
                    break;
                case 'GetLastError':
                    that.GetLastError();
                    break;
                case 'GetErrorString':
                    that.GetLastError(action.data.error);
                    break;
                case 'GetDiagnostic':
                    that.GetLastError(action.data.error);
                    break;
            }
        }
        return that;
    }

    updateCmi() {
        let that = this;
        that.remoteAction('UpdateRemote');
        return that;
    }

    // FAKE SCORM METHOD

    fakeScorm() {
        let that = this,
            timestamp = new Date().getTime(),
            session_time = timestamp - that.timestart,
            cmit = {
                'h': 0,
                'm': 0,
                's': 0,
                'mm': session_time
            };
        cmit.s = Math.floor(cmit.mm / 1000);
        cmit.mm -= cmit.s * 1000;
        cmit.m = Math.floor(cmit.s / 60);
        cmit.s -= cmit.m * 60;
        cmit.h = Math.floor(cmit.m / 60);
        cmit.m -= cmit.h * 60;

        cmit.mm = `${cmit.mm}`.padStart(2, 0).substr(0, 2);
        cmit.s = `${cmit.s}`.padStart(2, 0);
        cmit.m = `${cmit.m}`.padStart(2, 0);
        cmit.h = `${cmit.h}`.padStart(4, 0);

        cmit = _.values(cmit).join(':');
        console.log('FakeScorm! ==> ' + cmit);
        that.SetValue('cmi.core.session_time', cmit);
        that.SetValue('cmi.core.lesson_status', 'incomplete');
        that.SetValue('cmi.suspend_data', 'EasyScorm::FakeScorm (' + timestamp + ')');
        that.Commit();
        setTimeout(() => {
            that.fakeScorm();
        }, 5000);
    }

    // SCORM 2004 METHODS
    Initialize() {
        let that = this,
            res = true;
        if (that.mode) {
            if (that.apiVersion == '1.2') {
                res = that.api.LMSInitialize('');
            } else {
                res = that.api.Initialize('');
            }
        } else {
            that.remoteAction('Initialize', {});
        }
        return res;
    }

    Terminate() {
        let that = this,
            res = true;
        if (that.mode) {
            if (that.apiVersion == '1.2') {
                res = that.api.LMSFinish('');
            } else {
                res = that.api.Terminate('');
            }
        } else {
            that.remoteAction('Terminate', {});
        }
        return res;
    }

    GetValue(param) {
        let that = this,
            res = '';
        if (that.mode) {
            if (that.apiVersion == '1.2') {
                res = that.api.LMSGetValue(param);
            } else {
                res = that.api.GetValue(param);
            }
        } else {
            that.remoteAction('GetValue', {
                param: param
            });
        }
        return res;
    }

    SetValue(param, value) {
        let that = this,
            res = '';
        if (that.mode) {
            if (that.apiVersion == '1.2') {
                res = that.api.LMSSetValue(param, value);
            } else {
                res = that.api.SetValue(param, value);
            }
        } else {
            that.remoteAction('SetValue', {
                param: param,
                value: value
            });
        }
        return res;
    }

    Commit() {
        let that = this,
            res = true;
        if (that.mode) {
            if (that.apiVersion == '1.2') {
                res = that.api.LMSCommit('');
            } else {
                res = that.api.Commit('');
            }
        } else {
            that.remoteAction('Commit', {});
        }
        return res;
    }

    GetLastError() {
        let that = this,
            res = 0;
        if (that.mode) {
            if (that.apiVersion == '1.2') {
                res = that.api.LMSGetLastError();
            } else {
                res = that.api.GetLastError();
            }
        } else {
            that.remoteAction('GetLastError', {});
        }
        return res;
    }

    GetErrorString(error) {
        let that = this,
            res = '';
        if (that.mode) {
            if (that.apiVersion == '1.2') {
                res = that.api.LMSGetErrorString();
            } else {
                res = that.api.GetErrorString();
            }
        } else {
            that.remoteAction('GetErrorString', {
                error: error
            });
        }
        return res;
    }

    GetDiagnostic(error) {
        let that = this,
            res = '';
        if (that.mode) {
            if (that.apiVersion == '1.2') {
                res = that.api.LMSGetDiagnostic();
            } else {
                res = that.api.GetDiagnostic();
            }
        } else {
            that.remoteAction('GetDiagnostic', {
                error: error
            });
        }
        return res;
    }

    // SCORM 1.2 ADAPTERS

    LMSInitialize() {
        return this.Initialize();
    }
    LMSFinish() {
        return this.Terminate();
    }
    LMSGetValue(param) {
        return this.GetValue(param);
    }
    LMSSetValue(param, value) {
        return this.SetValue(param, value);
    }
    LMSCommit() {
        return this.Commit();
    }
    LMSGetLastError() {
        return this.GetLastError();
    }
    LMSGetErrorString(error) {
        return this.GetErrorString(error);
    }
    LMSGetDiagnostic(error) {
        return this.GetDiagnostic(error);
    }


}