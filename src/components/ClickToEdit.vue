<template>
  <div class="inline">
    <input type="text"
           v-if="edit"
           :value="valueLocal"
           @blur.native="valueLocal = $event.target.value; edit = false; $emit('input', valueLocal);"
           @keyup.enter.native="valueLocal = $event.target.value; edit = false; $emit('input', valueLocal);"
           v-focus=""
    />
    <span v-else="" @click="edit = true;">
      {{ valueLocal }}
    </span>
  </div>
</template>

<style scoped>
.inline {
  display: inline-block;
}

span {
  font-weight: bold;
}
</style>

<script>
export default {

  props: ["value"],

  data() {
    return {
      edit: false,
      valueLocal: this.value
    };
  },

  watch: {
    value: function() {
      this.valueLocal = this.value;
    }
  },

  directives: {
    focus: {
      inserted(el) {
        el.focus();
      }
    }
  }

};
</script>