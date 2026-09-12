<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { CanvasSpace } from "pts";

const props = defineProps<{
  onDisposed: (value: boolean) => void;
}>();
const reportDisposed = props.onDisposed;
const canvas = ref<HTMLCanvasElement | null>(null);
let space: CanvasSpace | undefined;
let active = true;

onMounted(() => {
  if (!canvas.value) return;
  const element = canvas.value;
  let frames = 0;
  space = new CanvasSpace(element, () => {
    if (!active || !space) return;
    const form = space.getForm();
    space.add({
      animate: () => {
        frames += 1;
        element.dataset.frames = String(frames);
        form.fillOnly("#f97316").point([160, 90], 14, "circle");
      },
    });
    space.play();
  }).setup({ bgcolor: "#0f172a", resize: false, retina: false });
});

onBeforeUnmount(() => {
  active = false;
  if (!space) return;
  const disposedSpace = space;
  disposedSpace.stop();
  disposedSpace.dispose();
  setTimeout(() => reportDisposed(!disposedSpace.isPlaying), 50);
});
</script>

<template>
  <div class="stage">
    <canvas
      ref="canvas"
      data-pts-canvas
      data-frames="0"
      width="320"
      height="180"
    />
  </div>
</template>
