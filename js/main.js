window.App = new Vue({
    el: '#app',
    data: {
        easyscorm: JSON.parse(JSON.stringify(window.easyscorm_test)),
        clean_easyscorn: JSON.parse(JSON.stringify(window.easyscorm_test)),
        tmp: {
            extras: {
                stylesheet: '',
                javascript: ''
            }
        }
    },
    methods: {
        configToJson: () => {
            let that = window.App;
            return JSON.parse(JSON.stringify(that.easyscorm));
        },
        writeTestVariable: () => {
            let that = window.App;
            that.easyscorm.url = that.easyscorm.url.trim();
            that.easyscorm.courseTitle = that.easyscorm.courseTitle.trim();
            that.easyscorm.scormTitle = that.easyscorm.scormTitle.trim();
            that.easyscorm.author = that.easyscorm.author.trim();
            if (that.easyscorm.courseTitle == '') {
                that.easyscorm.courseTitle = `Course ${that.easyscorm.courseId}`;
            }
            if (that.easyscorm.scormTitle == '') {
                that.easyscorm.scormTitle = `Scorm ${that.easyscorm.scormId}`;
            }
            if (that.easyscorm.author == '') {
                that.easyscorm.author = `Jogn.Net`;
            }
            window.easyscorm_test = that.configToJson();
            return that;
        },
        refreshPreview: () => {
            let that = window.App;
            document.getElementById('preview').src = 'index_scorm.html';
            return that;
        },
        onPreview: () => {
            let that = window.App;
            that.writeTestVariable();
            that.refreshPreview();
            return that;
        },
        onReset: () => {
            let that = window.App,
                keys = Object.keys(that.clean_easyscorn);
            for(let i = 0; i < keys.length; i++) {
                let key = keys[i];
                that.easyscorm[key] = that.clean_easyscorn[key];
            }
            that.writeTestVariable();
            return that;
        },
        onDownload: () => {
            let that = window.App,
                zip = new JSZip(),
                config = that.writeTestVariable().configToJson();
                zip.file("easyscorm.json", JSON.stringify(config));
            axios.get("./index_scorm.html").then(index_scorm => {
                index_scorm = index_scorm.data;
                zip.file("index_scorm.html", index_scorm);
                axios.get("./imsmanifest.xml").then(imsmanifest => {
                    imsmanifest = imsmanifest.data;
                    imsmanifest = _.replace(imsmanifest, new RegExp(':courseId', 'g'), that.easyscorm.courseId);
                    imsmanifest = _.replace(imsmanifest, new RegExp(':courseTitle', 'g'), that.easyscorm.courseTitle);
                    imsmanifest = _.replace(imsmanifest, new RegExp(':scormId', 'g'), that.easyscorm.scormId);
                    imsmanifest = _.replace(imsmanifest, new RegExp(':scormTitle', 'g'), that.easyscorm.scormTitle);
                    zip.file("imsmanifest.xml", imsmanifest);
                    zip.generateAsync({type:"blob"})
                    .then(function(content) {
                        saveAs(content, "scorm.zip");
                    });
                });
            });
            return that;
        },
        onUpload: () => {
            return that;
        },
        onDownloadDP: () => {
            axios.get("./doppelganger.html").then(doppelganger => {
                doppelganger = doppelganger.data;
                saveAs(new Blob([doppelganger], {type: "text/html;charset=utf-8"}), "doppelganger.html");
            });
            return that;
        },
        onAddExtraStylesheet: () => {
            let that = window.App;
            that.easyscorm.extras.stylesheets.push(that.tmp.extras.stylesheet.trim());
            that.tmp.extras.stylesheet = '';
            return that;
        },
        onAddExtraStylesheetKeyDown: (event) => {
            let that = window.App;
            if (event.which === 13) {
                that.onAddExtraStylesheet();
            }
            return that;
        },
        onRemoveExtraStyleesheet: (stylesheetId) => {
            let that = window.App;
            that.easyscorm.extras.stylesheets.splice(stylesheetId, 1);
            return that;
        },
        onAddExtraJavascript: () => {
            let that = window.App;
            that.easyscorm.extras.javascripts.push(that.tmp.extras.javascript.trim());
            that.tmp.extras.javascript = '';
            return that;
        },
        onAddExtraJavascriptKeyDown: (event) => {
            let that = window.App;
            if (event.which === 13) {
                that.onAddExtraJavascript();
            }
            return that;
        },
        onRemoveExtraJavascript: (javascriptId) => {
            let that = window.App;
            that.easyscorm.extras.javascripts.splice(javascriptId, 1);
            return that;
        }
    }
  })