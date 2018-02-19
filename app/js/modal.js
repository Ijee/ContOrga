const electron = require('electron')
const path = require('path')
const remote = electron.remote


var modalapp = new Vue({
    el: '#modal',
    methods: {
        cancelBtn() {
            var window = remote.getCurrentWindow()
            window.close()
        },
        okBtn() {
            return;
        },
        chooseDelete() {
            return;
        }
    }
})