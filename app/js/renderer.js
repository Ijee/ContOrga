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
    /**
     * The length of all current list elements.
     */
    rowLength: function () {
      return Object.keys(this.tabellenEintrag).length + 1;
    },
    /**
     * Sets all inputs to disabled if if there is no list.
     */
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
    /** 
     * Creates the modal dialog for the client.
     */
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
    /**
     * Adds the necessary css classes to display the arrow for sorting the table.
     * @param index the index of the table column that gets the asc or dsc css class
     */
    addClass: function (index) {
      ret = 'arrow heading' + (index + 1);
      if (this.sortKey == index && this.sortKey < 8) {
        ret += ' active';
        ret += this.reverse ? ' asc' : ' dsc';
      }
      return ret;
    },
    /**
     * Sorts the table based on the 
     * @param index
     */
    sortBy: function (index) {
      this.reverse = (this.sortKey == index) ? !this.reverse : false;
      this.sortKey = index;
      this.filterList();
    },
    /**
     * Changes the currently selected table to the one requested.
     * @param index the shipentries list index
     */
    changeTable: function (index) {
      //change current data to table that is to be displayed
      this.shipInfo = this.shipentries[index].shipInfo;
      this.tabellenEintrag = this.shipentries[index].tabellenEintrag;

      this.currentList = index;
      this.filterList();
    },
    /**
     * Adds a new table to the list of tables.
     * @param shipInfo 
     * @param entries 
     */
    addTable: function (shipInfo, entries) {
      this.shipentries.push(new ship(shipInfo, entries));
      this.changeTable(Object.keys(this.shipentries).length - 1);
    },
    /**
     * removes the currently selected table.
     */
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
    /**
     * 
     */
    filterList: function () {
      if (this.search.length > 0) {
        this.searchList = this.tabellenEintrag.filter(this.myFilter);
      }
      else {
        this.searchList = this.tabellenEintrag.concat([]);
      }
      this.searchList.sort(this.mySorter);
    },
    /**
     * 
     */
    myFilter: function (obj) {
      boo = false;
      for (e in obj) {
        if (obj[e] && typeof obj[e] == 'string') boo = boo || obj[e].toLowerCase().search(this.search.toLowerCase()) > -1;
      }
      return boo;
    },
    /**
     * 
     */
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
    /**
     * Adds a new row for the currently selected table.
     */
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
    /**
     * Deletes a specific row based on the param and calls updateRowID() after.
     * @param eintrag 
     */
    deleteRow: function (eintrag) {
      this.tabellenEintrag.splice(eintrag.ID - 1, 1);
      this.updateRowID();
    },
    /**
     * Updates the displayed IDs for entries in the currently selected table.
     */
    updateRowID: function () {
      for (var i = 1; i <= Object.keys(this.tabellenEintrag).length; i++) {
        this.tabellenEintrag[i - 1].ID = i;
      }
      this.filterList();
    },
    /**
     * Loads a new table into the app.
     */
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
          for (var i = 0; i < fileNames.length; i++) {
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
    /**
     * Exports the currently selected table as either json or xlsx to a specified path.
     * @param index the index of the list that is going to get exported.
     */
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
    /**
     * Exports all tables that are currently in use in the app to a specified path.
     * @param fileExt the file extension that was selected
     */
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
        for (var i = 0; i < this.shipentries.length; i++) {
          filePath = path.join(dir[0], date.toISOString().substring(0, 10) + '-' + this.shipentries[i].shipInfo.name + '.' + fileExt);
          this.saveFile(filePath, i, fileExt);
        }
      }
    },
    /**
     * Saves a file on the client based on params.
     * @param file the selected file path
     * @param index the index for the shipentries list 
     * @param fileExt the file extension that was selected
     */
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
        for (var i = 1; i < this.columns.length - 1; i++) {
          ws.cell(1, i).string(this.columns[i]).style({ font: { bold: true } });
        }
        for (var i = 0; i < this.shipentries[index].tabellenEintrag.length; i++) {
          for (var j = 1; j < this.actualColumns.length; j++) {
            entry = this.shipentries[index].tabellenEintrag[i][this.actualColumns[j]];
            if(entry == null) {
              ws.cell(i + 2, j).string('').style(style);
            } else {
              ws.cell(i + 2, j).string('' + entry).style(style);
            }
          }
        }
        wb.write(file);
      }
    }
  }
})
/**
 * @constructor 
 * @param shipInfo an object that stores name, eta, schiffsnotiz
 * @param tableObj an object that stores the table content
 */
function ship(shipInfo, tableobj) {
  this.shipInfo = shipInfo;
  this.tabellenEintrag = tableobj;
}

/*
 *  Sets the height of the css class maincontent based on resizing the window itself.
 *  - 183 is the pixel count based on the other content in maincontent
 */
function setHeight() {
  vueapp.currentHeight = maincontent.clientHeight - 183 + 'px';
}
/**
 * Calls vueapp filterList onkeyup for the search input.
 */
function filterList() {
  vueapp.filterList();
}
/**
 * This function waits on information from main.js that are used in modal.html to create a new table for the app.
 * @param event the event
 * @param functionality a string to differentiate between the users action in the modal
 */
ipc.on('ship-information', function (event, functionality) {
  if (functionality == 'addTable') {
    vueapp.addTable({ name: '', eta: '', schiffsnotiz: '' }, []);
  } else if (functionality == 'addExisting') {
    vueapp.loadFiles();
  }
})

