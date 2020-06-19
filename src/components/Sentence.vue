<template>
  <div
    class="sentence"
    :style="{
      top: `${data.y}px`,
      left: `${data.x}px`,
      width: `${data.w}px`,
      height: `${data.h}px`
    }"
  >
    <span>{{ data.text }}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
@Component
export default class Sentence extends Vue {
  @Prop() data: any;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.sentence {
  position: absolute;
}
.sentence span {
  background: rgba(255, 255, 255, 0.6);
  color: black;
  padding: 4px;
}
</style>
