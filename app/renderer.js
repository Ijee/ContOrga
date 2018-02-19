const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow

var app = new Vue({
    el: '#app',
    data: {
      seen: true
    },
    methods: {
      showModal() {
        const modalPath = path.join('file://', __dirname, 'modal.html')
        let win = new BrowserWindow({
          width: 400,
          height: 260,
          resizable: true,
          transpaent: true,
          alwaysOnTop: true,
          frame: true
        })
        win.setMenu(null);
        win.on('close', function() {
        win = null
        })

        win.loadURL(modalPath)
        win.show()
        win.webContents.openDevTools()
      },
      changeTable() {
        return;
      },
      addTable(name, eta, note, path) {
        return;
      },
      loadTable() {
        return;
      },
      saveTable() {
        return;
      },
      readFile() {
        return;
      },
      exportList() {
        return;
      },
      exportAll() {
        return;
      }
    }
  })