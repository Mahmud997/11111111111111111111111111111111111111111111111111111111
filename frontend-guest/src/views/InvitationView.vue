<template>
  <div class="invitation-page" v-if="data">
    <!-- INTRO SCREEN -->
    <IntroEnvelope
      v-if="showIntro"
      :seal-text="data.template.introConfig.sealText || 'A & M'"
      :button-text="data.template.introConfig.buttonText || 'Open Invitation'"
      :cover-image-url="data.template.introConfig.coverImageUrl"
      :type="data.template.introConfig.type"
      @opened="onIntroOpened"
    />

    <!-- CANVAS STAGE (mobile proportion) -->
    <div
      class="canvas-stage"
      :style="stageStyle"
      ref="stageRef"
    >
      <CanvasObject
        v-for="obj in data.template.objects"
        :key="obj.id"
        :obj="obj"
        :client-data="data.clientData"
        :slug="slug"
      />
    </div>

    <!-- Floating audio toggle (after unlock) -->
    <button
      v-if="audioUnlocked && data.template.audioConfig.enabled"
      class="audio-toggle"
      @click="toggleAudio"
      :aria-label="isPlaying ? 'Pause music' : 'Play music'"
    >
      {{ isPlaying ? '♪' : '♫' }}
    </button>
  </div>

  <div v-else-if="error" class="error-state">
    <p>{{ error }}</p>
  </div>

  <div v-else class="loading-state">
    <div class="spinner"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import IntroEnvelope from '../components/IntroEnvelope.vue';
import CanvasObject from '../components/CanvasObject.vue';
import { useAudioUnlock } from '../composables/useAudioUnlock';
import { useAutoScroll } from '../composables/useAutoScroll';

const props = defineProps<{ slug: string }>();

const data = ref<any>(null);
const error = ref('');
const showIntro = ref(false);
const stageRef = ref<HTMLElement | null>(null);

const { isUnlocked: audioUnlocked, isPlaying, unlockAndPlay, toggle: toggleAudio } = useAudioUnlock();
const { start: startAutoScroll } = useAutoScroll();

const stageStyle = computed(() => {
  if (!data.value) return {};
  const cfg = data.value.template.canvasConfig;
  return {
    width: `${cfg.width}px`,
    minHeight: `${cfg.height}px`,
    backgroundColor: cfg.backgroundColor || '#fff',
    backgroundImage: cfg.backgroundImageUrl ? `url(${cfg.backgroundImageUrl})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative' as const,
    margin: '0 auto',
    overflow: 'hidden',
  };
});

async function fetchInvitation() {
  try {
    const res = await axios.get(`/api/public/i/${props.slug}`);
    data.value = res.data;

    // Decide whether to show intro
    showIntro.value = !!(data.value.template.introConfig?.enabled);
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Invitation not found';
  }
}

async function onIntroOpened() {
  showIntro.value = false;

  // 1. Unlock & play audio (inside the same user gesture chain)
  const audioCfg = data.value.template.audioConfig;
  if (audioCfg?.enabled && audioCfg.url) {
    await unlockAndPlay(audioCfg.url, audioCfg.loop ?? true);
  }

  // 2. Start auto-scroll if configured
  const scrollCfg = data.value.template.autoScrollConfig;
  if (scrollCfg?.enabled) {
    // Small delay so the page has time to render
    setTimeout(() => {
      startAutoScroll(scrollCfg.speed || 2, scrollCfg.stopOnTouch ?? true);
    }, 800);
  }
}

onMounted(fetchInvitation);
</script>

<style scoped>
.invitation-page {
  min-height: 100vh;
  background: #1a120b;
  padding-bottom: 40px;
}

.canvas-stage {
  /* Centered on desktop, full width on mobile */
  max-width: 100vw;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.4);
}

.audio-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(61, 43, 31, 0.85);
  color: #f5e6d3;
  border: none;
  font-size: 20px;
  cursor: pointer;
  z-index: 100;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.loading-state,
.error-state {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f5e6d3;
  font-size: 18px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(245, 230, 211, 0.2);
  border-top-color: #f5e6d3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
