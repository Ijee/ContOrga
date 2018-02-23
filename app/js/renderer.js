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

    sortKey: 'ID',
    sortOrders: [],
    reverse: false,
    search: '',

    init: {},

    schiffsListe: [
      {
        schiffID: '1',
        schiffsname: 'C-3PO'
      },
      {
        schiffID: '2',
        schiffsname: 'Buzz'
      },
      {
        schiffID: '2',
        schiffsname: 'Buzz'
      },
      {
        schiffID: '2',
        schiffsname: 'Buzz'
      },
      {
        schiffID: '2',
        schiffsname: 'Buzz'
      },
      {
        schiffID: '2',
        schiffsname: 'Buzz'
      },
      {
        schiffID: '3',
        schiffsname: 'Droidekaaaa'
      },
      {
        schiffID: '4',
        schiffsname: 'R2-D2'
      },
      {
        schiffID: '5',
        schiffsname: 'Buzz'
      },
      {
        schiffID: '6',
        schiffsname: 'Droidekaaaa'
      }
    ],
    columns: ['ID',
      'Sdg Nr',
      'Container Nr',
      'Löschdatum',
      'Uhrzeit',
      'Status',
      'Abgabedatum',
      'Notiz',
      'Aktion'],
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
        ID: '2',
        SdgNr: '57001',
        ContainerNr: 'LAPD 3456789',
        Loeschdatum: '24.2.2018',
        Uhrzeit: '14:23',
        Status: 'n.g.',
        Abgabedatum: '26.2.2018',
        Notiz: 'alles supi'
      }]
  },
  computed: {
    rowLength: function() {
      return Object.keys(this.tabellenEintrag).length + 1;
    }
  },
  created: function() {
    this.columns.forEach(element => {
      this.sortOrders[element] = 1;
    });
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    first7: function (str) {
      if (str.length > 9) {
        return str.substring(0, 8) + '...';
      } else
      return str;
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
    addRow: function() {
      return;
    },
    deleteRow: function() {
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