<template>
  <div class="container">
    <div
      :class="isModal ? 'active' : 'inactive'"
      class="modal-wrapper"
      @click="cancel">>
      <div class="modal">
        <div class="modal-addnew">
          <button
            class="btn modalbtn addnewbtn"
            @click="addShip">Neue Tabelle</button>
        </div>
        <div class="modal-loadnew">
          <button
            class="btn modalbtn loadnewbtn"
            @click="addExisting">Tabelle(n) laden</button>
        </div>
        <div class="modal-cancel">
          <button
            class="btn modalbtn cancelbtn"
            @click="cancel">Abbrechen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isModal: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {};
  },
  methods: {
    addShip() {
      this.$emit('addShip');
    },
    addExisting() {
      this.$emit('addExisting');
    },
    cancel() {
      this.$emit('cancelModal');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.modal-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0);
  visibility: hidden;
  opacity: 0;
  transition: all 0.15s ease;
}
.modal {
  width: 350px;
  height: 200px;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  background: #fff;
  box-shadow: 0 0 2.5rem rgba(0, 0, 0, 0.5);
  transition: transform 0.1s ease;
  transform: scale(0.1);
}

.active {
  visibility: visible;
  opacity: 1;
  transform: scale(10);
  background-color: rgba(0, 0, 0, 0.5);
}

.inactive {
  visibility: hidden;
  opacity: 0;
  transform: scale(0.1);
}

.modalbtn {
  color: #fff;
  display: block;
  width: 100%;
  height: 100%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  font-weight: bolder;
  font-size: 1.1rem;
  text-transform: uppercase;
}

.addnewbtn {
  background-color: $modal-button-color-1;
  border-right: 0;
}

.loadnewbtn {
  background-color: $modal-button-color-2;
}
.cancelbtn {
  border-top: 0;
  background-color: $sidebar-active-btn;
}
</style>
