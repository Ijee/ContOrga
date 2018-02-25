const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const ipc = electron.ipcRenderer

const fs = require('fs')
const app = electron.remote.app

var vueapp = new Vue({
  el: '#app',
  data: {
    name: '',
    eta: '',
    schiffsnotiz: '',
    shipentries: [],
    currentList: '',

    sortKey: 'ID',
    sortOrders: [],
    reverse: false,
    search: '',

    init: {},

    columns: ['ID',
      'Sdg Nr',
      'Container Nr',
      'Löschdatum',
      'Uhrzeit',
      'Status',
      'Abgabedatum',
      'Notiz',
      'Aktion'],
    tabellenEintrag: []
  },
  computed: {
    rowLength: function () {
      return Object.keys(this.tabellenEintrag).length + 1;
    },
    disabled: function() {
      if(Object.keys(this.shipentries).length < 1) return true;
      return false;
    }
  },
  created: function () {
    this.columns.forEach(element => {
      this.sortOrders[element] = 1;
    });
  },
  filters: {
    capitalize: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    first8: function (str) {
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
      //win.webContents.openDevTools();
    },
    sortBy: function (sortKey) {
      this.reverse = (this.sortKey == sortKey) ? !this.reverse : false;

      this.sortKey = sortKey;
    },
    changeTable: function (index) {
      console.log(index);
      this.name = this.shipentries[index].name;
      this.eta = this.shipentries[index].shipETA;
      this.schiffsnotiz = this.shipentries[index].shipNotiz;
      this.tabellenEintrag = this.shipentries[index].tabellenEintrag;
    },
    addTable: function (name, eta, note) {
      this.shipentries.push(new ship(name, eta, note, []));
      this.inputdisable = false;
      var xmlData = app.getPath('desktop');
      this.path = path.join(xmlData + 'hello.txt');
      fs.writeFile(this.path, 'Hello Node.js', (err) => {
        if (err) throw err;
        console.log(xmlData);
      });
    },
    removeTable: function () {
      this.shipentries.splice(this.currentList);
    },
    loadTable: function (index) {
      return;
    },
    saveTable: function (index) {
      return;
    },
    addRow: function () {
      if (this.init.sdgnr === "") {
        return;
      }
      this.init = {
        ID: Object.keys(this.tabellenEintrag).length + 1,
        SdgNr: this.init.sdgnr,
        ContainerNr: this.init.containernr,
        Loeschdatum: this.init.loeschdatum,
        Uhrzeit: this.init.uhrzeit,
        Status: this.init.status,
        Abgabedatum: this.init.abgabedatum,
        Notiz: this.init.notiz
      };
      this.tabellenEintrag.push(this.init);
      this.init = {};
    },
    deleteRow: function (eintrag) {
      this.tabellenEintrag.splice(eintrag.ID - 1, 1);
      this.updateRowID();
    },
    updateRowID: function () {
      for (i = 1; i <= Object.keys(this.tabellenEintrag).length; i++) {
        this.tabellenEintrag[i - 1].ID = i;
      }
    },
    readFile: function () {
      return;
    },
    exportList: function () {

    },
    exportAll: function () {
      return;
    }
  }
})

function ship(name, shipETA, shipNote, tableobj) {
  this.name = name;
  this.shipETA = shipETA;
  this.shipNotiz = shipNote;
  this.tabellenEintrag = tableobj;
}

ipc.on('ship-information', function (event, modalName, modalETA, modalNote) {
  Vue.set(vueapp.$data, 'name', modalName);
  Vue.set(vueapp.$data, 'eta', modalETA);
  Vue.set(vueapp.$data, 'schiffsnotiz', modalNote);

  vueapp.addTable(modalName, modalETA, modalNote);
})
