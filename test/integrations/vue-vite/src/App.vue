<script setup lang="ts">
import { ref } from "vue";
import { Pt } from "pts";
import PtsCanvas from "./PtsCanvas.vue";

const mounted = ref(true);
const disposed = ref(false);
const point = new Pt(1, 2).add(3).toString();
const handleDisposed = (value: boolean) => {
  disposed.value = value;
};
const toggleCanvas = () => {
  if (!mounted.value) disposed.value = false;
  mounted.value = !mounted.value;
};
</script>

<template>
  <main
    id="status"
    data-environment="vue-vite"
    :data-point="point"
    :data-disposed="String(disposed)"
  >
    <h1>Pts + Vue + Vite</h1>
    <PtsCanvas v-if="mounted" :on-disposed="handleDisposed" />
    <button id="toggle" type="button" @click="toggleCanvas">
      {{ mounted ? "Unmount canvas" : "Remount canvas" }}
    </button>
  </main>
</template>
