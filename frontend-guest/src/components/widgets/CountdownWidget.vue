<template>
  <div class="countdown">
    <div v-for="unit in units" :key="unit.label" class="unit">
      <span class="value">{{ unit.value }}</span>
      <span class="label">{{ unit.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps<{ targetDate: string }>();

const now = ref(Date.now());
let timer: number;

onMounted(() => {
  timer = window.setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => clearInterval(timer));

const units = computed(() => {
  const target = new Date(props.targetDate).getTime();
  const diff = Math.max(0, target - now.value);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return [
    { value: String(days).padStart(2, '0'), label: 'Days' },
    { value: String(hours).padStart(2, '0'), label: 'Hours' },
    { value: String(minutes).padStart(2, '0'), label: 'Min' },
    { value: String(seconds).padStart(2, '0'), label: 'Sec' },
  ];
});
</script>

<style scoped>
.countdown {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 8px 0;
}

.unit {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(61, 43, 31, 0.08);
  border-radius: 10px;
  padding: 10px 4px;
}

.value {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 700;
  color: #3d2b1f;
  line-height: 1;
}

.label {
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #8a6f5a;
  margin-top: 4px;
}
</style>
