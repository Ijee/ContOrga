<template>
  <div class="home">
    <div class="grid-container">
      <div class="logo"/>
      <div class="grid-topbar"/>
      <div class="grid-sidebar">
        <main-shipentries
          ref="mainShipEntries"
          @shipChanged="shipChanged($event)"
          @enableButtons="isDisabled = false"
          @disableButtons="isDisabled = true"/>
      </div>
      <div class="addlistitem">
        <button
          class="btn addbtn"
          @click="isModal = true">+</button>
      </div>
      <div
        id="maincontent"
        class="grid-main">
        <div class="grid-main-wrap">
          <div class="grid-main-info">
            <div class="grid-main-title title">
              Schiffsinformationen
            </div>
            <div class="main-section">
              Name:
            </div>
            <input
              id="tablename"
              v-model="shipInfo.name"
              :disabled="isDisabled"
              class="generalinput">
            <div class="main-section">
              ETA:
            </div>
            <div class="main-filler"/>
            <input
              id="tableeta"
              v-model="shipInfo.eta"
              :disabled="isDisabled"
              class="generalinput">
            <div class="main-section">
              Notiz:
            </div>
            <input
              id="tablenote"
              v-model="shipInfo.schiffsnotiz"
              :disabled="isDisabled"
              class="generalinput">
          </div>
          <div class="grid-main-content">
            <div class="grid-main-content-title title">
              Containerliste
            </div>
            <div class="table-wrap">
              <div class="table-head">
                <div
                  v-for="(column, index) in columns"
                  :key="index"
                  :class="addClass(index)"
                  @click="sortBy(index)">
                  {{ column | capitalize }}
                </div>
              </div>
              <div
                id="tablelist"
                :style="{ height: currentHeight}"
                class="table-list">
                <div
                  v-for="(eintrag, index) in searchList"
                  :key="index"
                  class="table-content">
                  <div class="tableid cell">{{ eintrag.ID }}</div>
                  <div class="cell">
                    <input
                      v-model="eintrag.SdgNr"
                      class="tableinput tablesdgnr">
                  </div>
                  <div class="cell">
                    <input
                      v-model="eintrag.ContainerNr"
                      class="tableinput tablecontainernr">
                  </div>
                  <div class="cell">
                    <input
                      v-model="eintrag.Loeschdatum"
                      class="tableinput tableloeschdatum">
                  </div>
                  <div class="cell">
                    <input
                      v-model="eintrag.Halle"
                      class="tableinput tablehalle">
                  </div>
                  <div>
                    <select
                      v-model="eintrag.Status"
                      class="tableselect">
                      <option>n.g.</option>
                      <option>i.V.</option>
                      <option>✅</option>
                      <option>leer</option>
                    </select>
                  </div>
                  <div class="cell">
                    <input
                      v-model="eintrag.Abgabedatum"
                      class="tableinput tableabgabdedatum">
                  </div>
                  <div class="cell">
                    <input
                      v-model="eintrag.Notiz"
                      class="tableinput tablenotiz">
                  </div>
                  <button
                    class="tablebtn cell"
                    @click="deleteRow(eintrag)"/>
                </div>
                <div
                  id="tableadd"
                  :class="rowLength % 2 == 0 ? 'table-even' : 'table-odd'"
                  class="table-add">
                  <div class="addrowlength">{{ rowLength }}</div>
                  <div class="addsdgnr">
                    <input
                      v-model="init.sdgnr"
                      :disabled="isDisabled">
                  </div>
                  <div class="addcontainernr">
                    <input
                      v-model="init.containernr"
                      :disabled="isDisabled">
                  </div>
                  <div class="addloeschdatum">
                    <input
                      v-model="init.loeschdatum"
                      :disabled="isDisabled">
                  </div>
                  <div class="addhalle">
                    <input
                      v-model="init.halle"
                      :disabled="isDisabled">
                  </div>
                  <div>
                    <select
                      v-model="init.status"
                      :disabled="isDisabled"
                      class="addtableselect">
                      <option>n.g.</option>
                      <option>i.V.</option>
                      <option>✅</option>
                      <option>leer</option>
                    </select>
                  </div>
                  <div class="addabgabedatum">
                    <input
                      v-model="init.abgabedatum"
                      :disabled="isDisabled">
                  </div>
                  <div class="addnotiz">
                    <input
                      v-model="init.notiz"
                      :disabled="isDisabled">
                  </div>
                  <button
                    :disabled="isDisabled"
                    class="btn tableaddbtn cell"
                    @click="addRow">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid-footer">
        <main-footer
          :is-disabled="isDisabled"
          :search="search"
          @filterList="filterList"
          @exportList="exportList"
          @exportAll="exportAll($event)"
          @removeShip="removeShip"/>
      </div>
    </div>
    <main-modal
      :is-modal="isModal"
      @addShip="addShip"
      @addExisting="loadFiles"
      @cancelModal="isModal = false "/>
  </div>
</template>

<script>
// @ is an alias to /src
import MainShipEntries from '@/components/main/MainShipEntries.vue';
import MainFooter from '@/components/main/MainFooter.vue';
import MainModal from '@/components/main/MainModal.vue';

// const xl = require('excel4node');
// import * as Excel from 'excel4node';

export default {
  name: 'Home',
  components: {
    'main-shipentries': MainShipEntries,
    'main-footer': MainFooter,
    'main-modal': MainModal,
  },
  filters: {
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
  },
  data() {
    return {
      shipInfo: {
        name: '',
        eta: '',
        schiffsnotiz: '',
      },
      tabellenEintrag: [],

      search: { searchString: '' },
      sortKey: 0,
      reverse: false,

      init: {},
      searchList: {},
      currentHeight: '',

      isModal: false,
      isDisabled: true,

      // colums -> table header
      columns: [
        'ID',
        'Sdg Nr',
        'Container Nr',
        'Löschdatum',
        'Halle',
        'Status',
        'Abgabedatum',
        'Notiz',
        'Aktion',
      ],
      // actualColumns -> entries from tabellenEintrag
      actualColumns: [
        'ID',
        'SdgNr',
        'ContainerNr',
        'Loeschdatum',
        'Halle',
        'Status',
        'Abgabedatum',
        'Notiz',
      ],
    };
  },
  computed: {
    /**
     * The length of all current list elements.
     */
    rowLength() {
      return Object.keys(this.tabellenEintrag).length + 1;
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setHeight);
  },
  mounted() {
    window.addEventListener('resize', this.setHeight);
  },
  created() {},
  methods: {
    removeShip() {
      this.$refs.mainShipEntries.removeShip();
    },
    addShip() {
      this.$refs.mainShipEntries.addShip(
        { name: '', eta: '', schiffsnotiz: '' },
        [],
      );
      this.isModal = false;
    },
    loadFiles() {
      console.log(this.$refs.mainShipEntries);
      this.$refs.mainShipEntries.loadFiles();
      this.isModal = false;
    },
    exportList() {
      this.$refs.mainShipEntries.exportList();
    },
    exportAll() {
      this.$refs.mainShipEntries.exportAll();
    },
    /**
     * Adds the necessary css classes to display the arrow for sorting the table.
     * @param index the index of the table column that gets the asc or dsc css class
     */
    addClass(index) {
      let ret = 'arrow heading' + (index + 1);
      if (this.sortKey === index && this.sortKey < 8) {
        ret += ' active';
        ret += this.reverse ? ' asc' : ' dsc';
      }
      return ret;
    },
    /**
     * Sorts the table based on the
     * @param index
     */
    sortBy(index) {
      this.reverse = this.sortKey === index ? !this.reverse : false;
      this.sortKey = index;
      this.filterList();
    },
    /**
     *
     */
    filterList() {
      if (this.search.length > 0) {
        this.searchList = this.tabellenEintrag.filter(
          this.myFilter,
          this.search.searchString,
        );
      } else {
        this.searchList = this.tabellenEintrag.concat([]);
      }
      this.searchList.sort(this.mySorter);
    },
    /**
     *
     */
    myFilter(obj) {
      let boo = false;
      Object.keys(obj).array.forEach((e) => {
        if (obj[e] && typeof obj[e] === 'string') {
          boo = boo || obj[e].toLowerCase().search(this.toLowerCase()) > -1;
        }
      });
      return boo;
    },
    /**
     *
     */
    mySorter(a, b) {
      const sort = this.actualColumns[this.sortKey];
      const x = a[sort];
      const y = b[sort];
      if (!x && !y) return 0;
      if (!x) return 1;
      if (!y) return -1;
      if (typeof x === 'number') return this.reverse ? y - x : x - y;
      if (typeof x === 'string') {
        return this.reverse ? y.localeCompare(x) : x.localeCompare(y);
      }
      console.log('Big Mistake was made');
      return 0;
    },
    /**
     * Changes shit
     */
    shipChanged(currentShip) {
      this.shipInfo = currentShip.shipInfo;
      this.tabellenEintrag = currentShip.tabellenEintrag;
      this.filterList();
    },
    /**
     * Adds a new row for the currently selected table.
     */
    addRow() {
      const newRow = {};
      newRow[this.actualColumns[0]] =
        Object.keys(this.tabellenEintrag).length + 1;
      newRow[this.actualColumns[1]] = this.init.sdgnr;
      newRow[this.actualColumns[2]] = this.init.containernr;
      newRow[this.actualColumns[3]] = this.init.loeschdatum;
      newRow[this.actualColumns[4]] = this.init.halle;
      newRow[this.actualColumns[5]] = this.init.status;
      newRow[this.actualColumns[6]] = this.init.abgabedatum;
      newRow[this.actualColumns[7]] = this.init.notiz;

      this.tabellenEintrag.push(newRow);
      this.init = {};
      // scroll to bottom
      setTimeout(() => {
        this.tablelist.scrollTop = this.tablelist.scrollHeight;
      }, 1);
      this.filterList();
    },
    /**
     * Deletes a specific row based on the param and calls updateRowID() after.
     * @param eintrag
     */
    deleteRow(eintrag) {
      this.tabellenEintrag.splice(eintrag.ID - 1, 1);
      this.updateRowID();
    },
    /**
     * Updates the displayed IDs for entries in the currently selected table.
     */
    updateRowID() {
      for (let i = 1; i <= Object.keys(this.tabellenEintrag).length; i += 1) {
        this.tabellenEintrag[i - 1].ID = i;
      }
      this.filterList();
    },
    /*
    *  Sets the height of the css class maincontent based on resizing the window itself.
    *  - 183 is the pixel count based on the other content in maincontent
    */
    setHeight() {
      const newHeight =
        document.getElementById('maincontent').clientHeight - 183;
      this.currentHeight = newHeight + 'px';
    },
  },
};
</script>

<style scoped lang="scss">
.logo {
  border-right: 1px solid #000;
  background-color: $sidebar-main-color;
  background-image: url("../assets/Contorga_logo_min.png");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
}
</style>
