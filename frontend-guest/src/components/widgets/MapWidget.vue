<template>
  <a
    v-if="mapUrl"
    :href="mapUrl"
    target="_blank"
    rel="noopener"
    class="map-btn"
    :style="btnStyle"
  >
    {{ label }}
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  mapUrl?: string;
  label: string;
  style?: Record<string, any>;
}>();

const btnStyle = computed(() => {
  const s = props.style || {};
  return {
    backgroundColor: s.backgroundColor || '#3d2b1f',
    color: s.color || '#fff',
    borderRadius: s.borderRadius ? `${s.borderRadius}px` : '8px',
    fontSize: s.fontSize ? `${s.fontSize}px` : '16px',
    textAlign: 'center' as const,
  };
});
</script>

<style scoped>
.map-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  text-decoration: none;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: transform 0.2s, opacity 0.2s;
}

.map-btn:active {
  transform: scale(0.97);
  opacity: 0.9;
}
</style>
