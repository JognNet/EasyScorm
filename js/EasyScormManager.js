class EasyScormManager {
    constructor() {
        let that = this;
        if (typeof (window.parent) !== 'undefined' && typeof (window.parent.easyscorm_test) !== 'undefined') {
            that.rsco = that.masterEasyScorm(window.parent.easyscorm_test);
        } else {
            fetch("easyscorm.json").then(response => response.json()).then(easyscorm => {
                that.rsco = that.masterEasyScorm(easyscorm);
            });
        }
    }
    masterEasyScorm(options) {
        let that = this;
        that.options = options;
        for (let i = 0; i < _.size(options.stylesheets); i++) {
            let stylesheet = stylesheets[i],
                stylesheet_dom = document.createElement('link');
            stylesheet_dom.type = 'text/css';
            stylesheet_dom.rel = 'stylesheet';
            stylesheet_dom.href = stylesheet
        }
        for (let i = 0; i < _.size(options.javascripts); i++) {
            let javascript = javascripts[i],
                javascript_dom = document.createElement('script');
            javascript_dom.src = javascript
        }
        return new RemoteScormManager({
            url: options.url,
            html: !options.isScormContent,
            target: document.getElementById('index_scorm')
        }).onReady(() => {});
    }
}
window.EasyScorm = new EasyScormManager();