const electron = require('electron')
const path = require('path')
const remote = electron.remote
const ipc = electron.ipcRenderer


var modalapp = new Vue({
    el: '#modal',
    data: {
        modalName: '',
        modalETA: '',
        modalNote: ''
    },
    methods: {
        chooseDelete: function() {
            return;
        },
        cancelBtn: function() {
            var window = remote.getCurrentWindow();
            window.close();
        },
        okBtn: function() {
            ipc.send('modal-information', this.$data.modalName, this.$data.modalETA, this.$data.modalNote);
            var window = remote.getCurrentWindow();
            window.close();
        }
    }
})


