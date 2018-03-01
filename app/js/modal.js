const electron = require('electron')
const path = require('path')
const remote = electron.remote
const ipc = electron.ipcRenderer

var modalapp = new Vue({
    el: '#modal',
    data: {

    },
    methods: {
        cancel: function() {
            var window = remote.getCurrentWindow();
            window.close();
        },
        addExisting: function() {
            ipc.send('modal-information', 'addExisting')
            this.cancel();
        },
        addTable: function() {
            ipc.send('modal-information', 'addTable');
            this.cancel();
        }
    }
})


