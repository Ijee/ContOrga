const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const ipc = electron.ipcRenderer

const fs = require('fs')
var dialog = require('electron').remote.dialog;

const app = electron.remote.app

var vueapp = new Vue({
  el: '#app',
  data: {
    name: '',
    eta: '',
    schiffsnotiz: '',
    shipentries: [],
    currentList: '',

    sortKey: 0,
    reverse: false,
    search: '',

    init: {},
    search: '',
    searchList: {},
    currentHeight: '',


    columns: ['ID',
      'Sdg Nr',
      'Container Nr',
      'Löschdatum',
      'Uhrzeit',
      'Status',
      'Abgabedatum',
      'Notiz',
      'Aktion'],
    actualColumns: ['ID',
        'SdgNr',
        'ContainerNr',
        'Loeschdatum',
        'Uhrzeit',
        'Status',
        'Abgabedatum',
    'Notiz'],
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
        backgroundColor: '#202225',
        show: false,
        frame: false
      });
      win.on('ready-to-show', function () {
        mainWindow.show();
        mainWindow.focus();
      });
      win.setMenu(null);
      win.on('close', function () {
        win = null;
      })

      win.loadURL(modalPath);
      win.show();
      //win.webContents.openDevTools();
    },
    addClass: function(index) {
      ret = 'arrow heading' + (index + 1);
      if(this.sortKey == index && this.sortKey < 8) {
        ret += ' active';
        ret += this.reverse ? ' asc' : ' dsc';
      }
      return ret;
    },
    sortBy: function (index) {
      this.reverse = (this.sortKey == index) ? !this.reverse : false;
      this.sortKey = index;
      this.filterList();
    },
    changeTable: function (index) {
      this.name = this.shipentries[index].name;
      this.eta = this.shipentries[index].shipETA;
      this.schiffsnotiz = this.shipentries[index].shipNotiz;
      this.tabellenEintrag = this.shipentries[index].tabellenEintrag;

      this.currentList = index;
      
      this.filterList();
    },
    addTable: function (name, eta, note) {
      this.shipentries.push(new ship(name, eta, note, []));
      this.changeTable(Object.keys(this.shipentries).length -1);
      
    },
    removeTable: function () {
      this.shipentries.splice(this.currentList, 1);
      if(this.currentList > 0) {
          this.changeTable(this.currentList - 1);
      }
      this.filterList();
    },
    filterList: function() {
        if(this.search.length > 0) {
            this.searchList = this.tabellenEintrag.filter(this.myFilter);
        }
        else {
            this.searchList = this.tabellenEintrag;
        }
        this.searchList.sort(this.mySorter);
    },
    myFilter: function(obj) {
        boo = false;
        for(e in obj)
        {
            if(obj[e] && typeof obj[e] == 'string') boo = boo || obj[e].toLowerCase().search(this.search.toLowerCase()) > -1;
        }
        return boo;
    },
    mySorter: function(a, b) {
        sort = this.actualColumns[this.sortKey];
        x = a[sort];
        y = b[sort];
        if(!x && !y) return 0;
        if(!x) return 1;
        if(!y) return -1
        if(typeof x == 'number') return this.reverse ? y-x : x-y;
        if(typeof x == 'string') return this.reverse ? y.localeCompare(x) : x.localeCompare(y);
        console.log('Big Mistake was made');
    },
    saveTable: function (index) {
      return;
    },
    addRow: function () {
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
      this.shipentries[this.currentList].tabellenEintrag.push(this.init);
      this.init = {};
      //scroll to bottom
      setTimeout(() => {
        tablelist.scrollTop = tablelist.scrollHeight;
        filterList();
      }, 1);
    },
    deleteRow: function (eintrag) {
      this.tabellenEintrag.splice(eintrag.ID - 1, 1);
      this.updateRowID();
    },
    updateRowID: function () {
      for (i = 1; i <= Object.keys(this.tabellenEintrag).length; i++) {
        this.tabellenEintrag[i - 1].ID = i;
      }
      this.filterList();
    },
    readFile: function () {
      return;
    },
    loadFiles: function (index) {
      dialog.showOpenDialog({ 
        properties: [ 
            'openFile', 'multiSelections', (fileNames) => {
                
                for(i= 0; i < fileNames.length; i++) {
                  console.log(i);
                }
            }
        ]
    });
    },
    exportList: function () {

      var savepath = app.getPath('desktop');
      this.path = path.join(savepath, 'hello.json');
      
      content = JSON.stringify(this.shipentries[this.currentList]);

      fs.writeFile(this.path, content, (err) => {
        if (err) throw err;
        
      });
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

/* 
  - 183 is the pixel count based on the other content in maincontent
*/
function setHeight() {
  vueapp.currentHeight = maincontent.clientHeight - 183 + 'px';
}

function filterList()
{
    vueapp.filterList();
}

ipc.on('ship-information', function (event, modalName, modalETA, modalNote) {
  Vue.set(vueapp.$data, 'name', modalName);
  Vue.set(vueapp.$data, 'eta', modalETA);
  Vue.set(vueapp.$data, 'schiffsnotiz', modalNote);

  vueapp.addTable(modalName, modalETA, modalNote);
})
