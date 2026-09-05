<template>
  <canvas ref="canvasRef" class="hero-snow" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHeroSnow } from 'src/composables/useHeroSnow';

const canvasRef = ref<HTMLCanvasElement | null>(null);

useHeroSnow(canvasRef, { density: 'medium', goldRatio: 0.15 });
</script>

<style scoped>
.hero-snow {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>