<template>
  <div class="container">
    <div class="grid-search">
      <input
        :disabled="isDisabled"
        v-model="search.searchString"
        type="text"
        name="search"
        placeholder="Suchen..."
        @keyup="filterList">
    </div>
    <div class="grid-exportall">
      <button class="funcbtn hoverbtn btn">Alle Exportieren</button>
      <button
        :disabled="isDisabled"
        style="margin-left: 0"
        class="funcbtn exportbtn btn"
        @click="exportAll('xlsx')">XLSX</button>
      <button
        :disabled="isDisabled"
        style="margin-right: 0"
        class="funcbtn exportbtn btn"
        @click="exportAll('json')">JSON</button>
    </div>
    <div class="grid-exportlist">
      <button
        :disabled="isDisabled"
        class="funcbtn btn"
        @click="exportList(currentList)">Liste Exportieren</button>
    </div>
    <div class="grid-removelist">
      <button
        :disabled="isDisabled"
        class="funcbtn btn"
        @click="removeShip">Liste entfernen</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isDisabled: {
      default: true,
      type: Boolean,
    },
    search: {
      default() {
        return { searchString: '' };
      },
      type: Object,
    },
  },
  data() {
    return {};
  },
  methods: {
    filterList() {
      this.$emit('filterList');
    },
    exportAll(fileExt) {
      this.$emit('exportAll', fileExt);
    },
    removeShip() {
      this.$emit('removeShip');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
