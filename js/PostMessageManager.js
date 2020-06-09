class PostMessageManager {
    constructor(options) {
        let that = this;
        that.options = typeof options == 'undefined' ? {} : options;
        that.url = typeof that.options.url == 'undefined' ? '*' : that.options.url;
        that.mode = that.url == '*' ? false : true;
        that.target = that.mode ? that.options.target.contentWindow : window.parent;
    }
    isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    encodeData(data) {
        return JSON.stringify(data);
        //return `PM:${window.btoa(unescape(encodeURIComponent(JSON.stringify(data))))}`;
    }
    decodeData(event) {
        let data = event.data;
        if (this.isJson(data)) {
            return JSON.parse(Object(data));
        }
        /*
        data = data.split(':', 2);
        if (data[0] == 'PM') {
            return Object(JSON.parse(decodeURIComponent(escape(window.atob(data[1])))));
        }
        */
        return {};
    }
    onReadRawMessage(cb, sources) {
        let that = this;
        sources = typeof source == 'undefined' ? [that.url] : sources;
        window.addEventListener(`message`, (event) => {
            //if (sources.indexOf('*') >= 0 || sources.indexOf(event.origin) >= 0 || event.origin == that.url) {
            cb(event);
            //}
        }, false);
        return that;
    }
    onReadMessage(cb, source) {
        let that = this;
        that.onReadRawMessage((data) => {
            cb(that.decodeData(data));
        }, source);
        return that;
    }
    sendRawMessage(message) {
        let that = this;
        that.target.postMessage(message, that.url);
        return that;
    }
    sendMessage(message) {
        let that = this;
        that.sendRawMessage(that.encodeData(message));
        return that;
    }
    onReady(cb) {
        let that = this;
        if (that.mode) {
            that.options.target.onload = () => {
                cb();
            };
        } else {
            window.onload = () => {
                cb();
            }
        }
        return that;
    }
}
window.PostMessageManager = PostMessageManager;