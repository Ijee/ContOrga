const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow

const ipc = electron.ipcRenderer

shipList = new Array();

var vueapp = new Vue({
  el: '#app',
  data: {
    name: '',
    eta: '',
    schiffsnotiz: '',
    
    sortkey: 'ID',
    reverse: false,
    search: '',


    schiffsListe: [
      {
     
      }
    ],
      columns: ['ID',
        'Sdg Nr',
        'Container Nr',
        'Löschdatum',
        'Uhrzeit',
        'Status',
        'Abgabedatum',
        'Notiz'],
      tabellenEintrag: [
        {
          ID: '1',
          SdgNr: '57000',
          ContainerNr: 'LAPD 1234567',
          Loeschdatum: '21.2.2018',
          Uhrzeit: '20:32',
          Status: 'n.g.',
          Abgabedatum: '22.2.2018',
          Notiz: 'notiz test'
        },
        {
          id: '2',
          sdgnr: '57001',
          containernr: 'LAPD 3456789',
          loeschdatum: '24.2.2018',
          uhrzeit: '14:23',
          status: 'n.g.',
          abgabedatum: '26.2.2018',
          notiz: 'alles supi'
        }],
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  },
  methods: {
    showModal: function () {
      const modalPath = path.join('file://', __dirname, 'modal.html')
      let win = new BrowserWindow({
        width: 400,
        height: 260,
        resizable: true,
        transpaent: true,
        alwaysOnTop: true,
        frame: true
      });
      win.setMenu(null);
      win.on('close', function () {
        win = null;
      })

      win.loadURL(modalPath);
      win.show();
      win.webContents.openDevTools();
    },
    sortBy: function (sortKey) {
      this.reverse = (this.sortKey == sortKey) ? !this.reverse : false;

      this.sortKey = sortKey;
    },
    changeTable: function () {
      return;
    },
    addTable: function (name, eta, note) {
      //TODO get table data
      new Ship(name, eta, note);
    },
    removeTable: function (name) {
      return;
    },
    loadTable: function () {
      return;
    },
    saveTable: function () {
      return;
    },
    readFile: function () {
      return;
    },
    exportList: function () {
      return;
    },
    exportAll: function () {
      return;
    }
  }
})

ipc.on('ship-information', function (event, modalName, modalETA, modalNote) {
  Vue.set(vueapp.$data, 'name', modalName);
  Vue.set(vueapp.$data, 'eta', modalETA);
  Vue.set(vueapp.$data, 'schiffsnotiz', modalNote);
  addTable(modalName, modalETA, modalNote);
})