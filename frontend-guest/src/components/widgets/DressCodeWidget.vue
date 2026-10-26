<template>
  <div class="dress-code">
    <p class="title">Dress Code</p>
    <div class="swatches">
      <div
        v-for="(color, i) in colors"
        :key="i"
        class="swatch"
        :style="{ backgroundColor: color }"
        :title="color"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ colors: string[] }>();
</script>

<style scoped>
.dress-code {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
}

.title {
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #8a6f5a;
}

.swatches {
  display: flex;
  gap: 12px;
}

.swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
