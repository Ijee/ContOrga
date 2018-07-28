<template>
  <div class="container">
    <ul class="grid-sidebar-wrap">
      <li
        v-for="(schiff, index) in shipentries"
        :key="index"
        class="listitem-container">
        <button
          :class="schiff.shipInfo == shipInfo ? 'active' : 'inactive'"
          class="btn listbtn"
          @click="changeShip(index)">
          <span class="listitem-name">{{ schiff.shipInfo.name | first8 }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
// const xl = {};
// import * as xl from './excel4node';

const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { dialog } = require('electron');

const xl = {};
/**
 * @constructor
 * @param shipInfo an object that stores name, eta, schiffsnotiz
 * @param tableObj an object that stores the table content
 */
function Ship(shipInfo, tableobj) {
  this.shipInfo = shipInfo;
  this.tabellenEintrag = tableobj;
}
export default {
  filters: {
    first8(str) {
      if (str.length > 9) {
        return str.substring(0, 8) + '...';
      }
      return str;
    },
  },
  props: {},
  data() {
    return {
      shipentries: [],
      currentList: 0,
    };
  },
  methods: {
    /**
     * Changes the currently selected ship to the one requested.
     * @param index the shipentries list index
     */
    changeShip(index) {
      // change current data to table that is to be displayed
      this.shipInfo = this.shipentries[index].shipInfo;
      this.tabellenEintrag = this.shipentries[index].tabellenEintrag;

      this.currentList = index;
      this.$emit('shipChanged', this.shipentries[this.currentList]);
    },
    /**
     * Adds a new table to the list of ships.
     * @param shipInfo
     * @param entries
     */
    addShip(shipInfo, entries) {
      this.shipentries.push(new Ship(shipInfo, entries));
      this.changeShip(Object.keys(this.shipentries).length - 1);
      this.$emit('enableButtons');
    },
    /**
     * removes the currently selected ship.
     */
    removeShip() {
      this.shipentries.splice(this.currentList, 1);
      if (this.currentList > 0) {
        this.changeShip(this.currentList - 1);
      } else {
        this.shipInfo = { name: '', eta: '', schiffsnotiz: '' };
        this.tabellenEintrag = [];
        this.$emit('disableButtons');
      }
    },
  },
  /**
   * Loads a new table into the app.
   */
  loadFiles() {
    console.log(2);
    dialog.showOpenDialog(
      {
        filters: [
          { name: 'All Files', extensions: ['txt', 'json'] },
          { name: 'text', extensions: ['txt'] },
          { name: 'json', extensions: ['json'] },
        ],
        properties: ['openFile', 'multiSelections'],
      },
      (fileNames) => {
        if (fileNames !== undefined) {
          for (let i = 0; i < fileNames.length; i += 1) {
            fs.readFile(
              fileNames[i],
              { encoding: 'utf-8', flag: 'r' },
              this.readFileCallback,
            );
          }
        }
      },
    );
  },
  readFileCallback(err, data) {
    if (err) {
      console.log(err);
    } else {
      const tmpData = JSON.parse(data);
      this.addShip(tmpData.shipInfo, tmpData.tabellenEintrag);
    }
  },
  /**
   * Exports the currently selected table as either json or xlsx to a specified path.
   * @param index the index of the list that is going to get exported.
   */
  exportList(index) {
    const savePath = app.getPath('home');
    const date = new Date();
    const filePath = path.join(
      savePath,
      date.toISOString().substring(0, 10) +
        '-' +
        this.shipentries[index].shipInfo.name +
        '.json',
    );
    const file = dialog.showSaveDialog({
      defaultPath: filePath,
      filters: [
        { name: 'json', extensions: ['json'] },
        { name: 'xlsx', extensions: ['xlsx'] },
      ],
    });
    if (file) {
      const fileExt = file.substr(file.lastIndexOf('.') + 1);
      this.saveFile(file, this.currentList, fileExt);
    }
  },
  /**
   * Exports all tables that are currently in use in the app to a specified path.
   * @param fileExt the file extension that was selected
   */
  exportAll(fileExt) {
    const savePath = app.getPath('home');
    const date = new Date();

    const dir = dialog.showOpenDialog({
      defaultPath: savePath,
      buttonLabel: 'Alle Speichern',
      properties: ['openDirectory'],
    });
    if (dir[0]) {
      for (let i = 0; i < this.shipentries.length; i += 1) {
        const filePath = path.join(
          dir[0],
          date.toISOString().substring(0, 10) +
            '-' +
            this.shipentries[i].shipInfo.name +
            '.' +
            fileExt,
        );
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
  saveFile(file, index, fileExt) {
    if (fileExt === 'json') {
      const content = JSON.stringify(this.shipentries[index]);
      fs.writeFile(file, content, (err) => {
        if (err) throw err;
      });
    } else {
      const wb = new xl.Workbook();
      // name = file.split('.')[0];
      const name = file.replace(/^.*[\\/]/, '').split('.')[0];
      console.log(name);
      const ws = wb.addWorksheet(name);

      const style = wb.createStyle({
        font: {
          size: 12,
        },
        numberFormat: '$#,##0.00; ($#,##0.00); -',
      });
      // this.columns.length - 1 to suppress the last column in the file output
      for (let i = 1; i < this.columns.length - 1; i += 1) {
        ws
          .cell(1, i)
          .string(this.columns[i])
          .style({ font: { bold: true } });
      }
      for (
        let i = 0;
        i < this.shipentries[index].tabellenEintrag.length;
        i += 1
      ) {
        for (let j = 1; j < this.actualColumns.length; j += 1) {
          const entry = this.shipentries[index].tabellenEintrag[i][
            this.actualColumns[j]
          ];
          if (entry == null) {
            ws
              .cell(i + 2, j)
              .string('')
              .style(style);
          } else {
            ws
              .cell(i + 2, j)
              .string('' + entry)
              .style(style);
          }
        }
      }
      wb.write(file);
    }
  },
};
</script>


<style scoped lang="scss">
</style>
