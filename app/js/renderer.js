const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const ipc = electron.ipcRenderer


const fs = require('fs')
var xl = require('excel4node');
var dialog = require('electron').remote.dialog;


const app = electron.remote.app

var vueapp = new Vue({
  el: '#app',
  data: {
    shipInfo: {
      name: '',
      eta: '',
      schiffsnotiz: ''
    },
    shipentries: [],
    currentList: '0',

    sortKey: 0,
    reverse: false,
    search: '',

    init: {},
    search: '',
    searchList: {},
    currentHeight: '',

    //temporary multiple modal window fix
    modalOpen: false,

    //colums -> index.html table header
    columns: ['ID',
      'Sdg Nr',
      'Container Nr',
      'Löschdatum',
      'Halle',
      'Status',
      'Abgabedatum',
      'Notiz',
      'Aktion'],
    //actualColumns -> entries from tabellenEintrag
    actualColumns: ['ID',
      'SdgNr',
      'ContainerNr',
      'Loeschdatum',
      'Halle',
      'Status',
      'Abgabedatum',
      'Notiz'],
    tabellenEintrag: []
  },
  computed: {
    rowLength: function () {
      return Object.keys(this.tabellenEintrag).length + 1;
    },
    disabled: function () {
      if (Object.keys(this.shipentries).length < 1) return true;
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
      if (!this.modalOpen) {
        this.modalOpen = true;
        const modalPath = path.join('file://', __dirname, 'modal.html');
        let win = new BrowserWindow({
          width: 400,
          height: 150,
          resizable: true,
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
          vueapp.modalOpen = false;
          win = null;
        })

        win.loadURL(modalPath);
        win.show();
        //win.webContents.openDevTools();
      }
    },
    addClass: function (index) {
      ret = 'arrow heading' + (index + 1);
      if (this.sortKey == index && this.sortKey < 8) {
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
      //change current data to table that is to be displayed
      this.shipInfo = this.shipentries[index].shipInfo;
      this.tabellenEintrag = this.shipentries[index].tabellenEintrag;

      this.currentList = index;
      this.filterList();
    },
    addTable: function (shipInfo, entries) {
      this.shipentries.push(new ship(shipInfo, entries));
      this.changeTable(Object.keys(this.shipentries).length - 1);
    },
    removeTable: function () {
      this.shipentries.splice(this.currentList, 1);
      if (this.currentList > 0) {
        this.changeTable(this.currentList - 1);
      } else {
        this.shipInfo = { name: '', eta: '', schiffsnotiz: '' };
        this.tabellenEintrag = [];
      }
      this.filterList();
    },
    filterList: function () {
      if (this.search.length > 0) {
        this.searchList = this.tabellenEintrag.filter(this.myFilter);
      }
      else {
        this.searchList = this.tabellenEintrag.concat([]);
      }
      this.searchList.sort(this.mySorter);
    },
    myFilter: function (obj) {
      boo = false;
      for (e in obj) {
        if (obj[e] && typeof obj[e] == 'string') boo = boo || obj[e].toLowerCase().search(this.search.toLowerCase()) > -1;
      }
      return boo;
    },
    mySorter: function (a, b) {
      sort = this.actualColumns[this.sortKey];
      x = a[sort];
      y = b[sort];
      if (!x && !y) return 0;
      if (!x) return 1;
      if (!y) return -1
      if (typeof x == 'number') return this.reverse ? y - x : x - y;
      if (typeof x == 'string') return this.reverse ? y.localeCompare(x) : x.localeCompare(y);
      console.log('Big Mistake was made');
    },
    saveTable: function (index) {
      return;
    },
    addRow: function () {
      newRow = {};
      newRow[this.actualColumns[0]] = Object.keys(this.tabellenEintrag).length + 1;
      newRow[this.actualColumns[1]] = this.init.sdgnr;
      newRow[this.actualColumns[2]] = this.init.containernr;
      newRow[this.actualColumns[3]] = this.init.loeschdatum;
      newRow[this.actualColumns[4]] = this.init.halle;
      newRow[this.actualColumns[5]] = this.init.status;
      newRow[this.actualColumns[6]] = this.init.abgabedatum;
      newRow[this.actualColumns[7]] = this.init.notiz;
      
      this.shipentries[this.currentList].tabellenEintrag.push(newRow);
      this.init = {};
      //scroll to bottom
      setTimeout(() => {
        tablelist.scrollTop = tablelist.scrollHeight;
      }, 1);
      filterList();
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
    loadFiles: function () {
      dialog.showOpenDialog({
        filters: [
          { name: 'All Files', extensions: ['txt', 'json'] },
          { name: 'text', extensions: ['txt'] },
          { name: 'json', extensions: ['json'] }

        ],
        properties: [
          'openFile', 'multiSelections'
        ],
      }, function (fileNames) {

        if (fileNames === undefined) {
          return;
        } else {
          for (i = 0; i < fileNames.length; i++) {
            fs.readFile(fileNames[i], { encoding: 'utf-8', flag: 'r' }, function (err, data) {
              if (err) {
                console.log(err);
              } else {
                tmpData = JSON.parse(data);
                vueapp.addTable(tmpData.shipInfo, tmpData.tabellenEintrag);
              }
            });
          }
        }
      })
    },
    exportList: function (index) {

      var savePath = app.getPath('home');
      date = new Date();
      filePath = path.join(savePath, date.toISOString().substring(0, 10) + '-' + this.shipentries[index].shipInfo.name + '.json');
      file = dialog.showSaveDialog({
        defaultPath: filePath,
        filters: [
          { name: 'json', extensions: ['json'] },
          { name: 'xlsx', extensions: ['xlsx'] }
        ]
      });
      if (file) {
        fileExt = file.substr(file.lastIndexOf('.') + 1);
        this.saveFile(file, this.currentList, fileExt);
      }
    },
    exportAll: function (fileExt) {
      var savePath = app.getPath('home');
      date = new Date();

      dir = dialog.showOpenDialog({
        defaultPath: savePath,
        buttonLabel: 'Alle Speichern',
        properties: [
          'openDirectory',
        ]
      });
      if (dir[0]) {
        for (i = 0; i < this.shipentries.length; i++) {
          filePath = path.join(dir[0], date.toISOString().substring(0, 10) + '-' + this.shipentries[i].shipInfo.name + '.' + fileExt);
          this.saveFile(filePath, i, fileExt);
          console.log('test');
        }
      }
    },
    saveFile: function (file, index, fileExt) {
      if (fileExt == 'json') {
        content = JSON.stringify(this.shipentries[index]);
        fs.writeFile(file, content, (err) => {
          if (err) throw err;
        });
      } else {
        wb = new xl.Workbook();
        //name = file.split('.')[0];
        name = file.replace(/^.*[\\\/]/, '').split('.')[0];
        console.log(name);
        ws = wb.addWorksheet(name);

        style = wb.createStyle({
          font: {
            size: 12,
          },
          numberFormat: '$#,##0.00; ($#,##0.00); -'
        });
        //this.columns.length - 1 to suppress the last column in the file output
        for(i = 1; i < this.columns.length - 1; i++) {
          ws.cell(1, i).string(this.columns[i]).style({ font: { bold: true}});
        }
        for (i = 0; i < this.shipentries[index].tabellenEintrag.length; i++) {
          for (j = 1; j < this.actualColumns.length; j++) {
            entry = this.shipentries[index].tabellenEintrag[i][this.actualColumns[j]];   
            ws.cell(i + 2, j).string('' + entry).style(style);
          }
        }
        wb.write(file);
      }
    }
  }
})

function ship(shipInfo, tableobj) {
  this.shipInfo = shipInfo;
  this.tabellenEintrag = tableobj;
}

/* 
  - 183 is the pixel count based on the other content in maincontent
*/
function setHeight() {
  vueapp.currentHeight = maincontent.clientHeight - 183 + 'px';
}

function filterList() {
  vueapp.filterList();
}

ipc.on('ship-information', function (event, functionality) {
  if (functionality == 'addTable') {
    vueapp.addTable({ name: '', eta: '', schiffsnotiz: '' }, []);
  } else if (functionality == 'addExisting') {
    vueapp.loadFiles();
  }
})
