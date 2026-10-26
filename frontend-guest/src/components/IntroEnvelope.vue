<template>
  <div
    v-if="visible"
    class="intro-overlay"
    :class="{ opening: isOpening }"
    @click="handleOpen"
    @touchstart.passive="handleOpen"
  >
    <!-- Envelope body -->
    <div class="envelope" ref="envelopeRef">
      <div class="envelope-flap" ref="flapRef"></div>
      <div class="envelope-body">
        <div class="wax-seal" ref="sealRef">
          <span class="seal-text">{{ sealText }}</span>
        </div>
      </div>
      <div class="envelope-letter" ref="letterRef">
        <p class="letter-preview">{{ buttonText }}</p>
      </div>
    </div>

    <p class="hint">Tap to open</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import gsap from 'gsap';

const props = defineProps<{
  sealText: string;
  buttonText: string;
  coverImageUrl?: string;
  type?: 'envelope' | 'jewelry_box' | 'wax_seal';
}>();

const emit = defineEmits<{
  (e: 'opened'): void;
}>();

const visible = ref(true);
const isOpening = ref(false);
const envelopeRef = ref<HTMLElement | null>(null);
const flapRef = ref<HTMLElement | null>(null);
const sealRef = ref<HTMLElement | null>(null);
const letterRef = ref<HTMLElement | null>(null);

let opened = false;

function handleOpen() {
  if (opened) return;
  opened = true;
  isOpening.value = true;

  const tl = gsap.timeline({
    onComplete: () => {
      // Fade out whole overlay
      gsap.to('.intro-overlay', {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
          visible.value = false;
          emit('opened');
        },
      });
    },
  });

  // 1. Seal shrinks & disappears
  tl.to(sealRef.value, {
    scale: 0.3,
    opacity: 0,
    duration: 0.4,
    ease: 'back.in(1.7)',
  });

  // 2. Flap opens upward
  tl.to(
    flapRef.value,
    {
      rotateX: -180,
      duration: 0.7,
      ease: 'power2.inOut',
      transformOrigin: 'top center',
    },
    '-=0.2'
  );

  // 3. Letter slides up
  tl.to(
    letterRef.value,
    {
      y: -80,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    },
    '-=0.4'
  );

  // 4. Whole envelope scales down slightly
  tl.to(
    envelopeRef.value,
    {
      scale: 0.9,
      duration: 0.5,
      ease: 'power2.in',
    },
    '-=0.3'
  );
}

onMounted(() => {
  // Subtle floating animation while waiting
  gsap.to(envelopeRef.value, {
    y: -8,
    duration: 2.2,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  });
});
</script>

<style scoped>
.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: linear-gradient(160deg, #2a1f16 0%, #1a120b 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  perspective: 1200px;
}

.envelope {
  position: relative;
  width: 280px;
  height: 180px;
  transform-style: preserve-3d;
}

.envelope-body {
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, #f5e6d3, #e8d5b7);
  border-radius: 4px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.envelope-flap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 90px;
  background: linear-gradient(160deg, #e8d5b7, #d4c0a0);
  clip-path: polygon(0 0, 50% 70%, 100% 0);
  transform-origin: top center;
  z-index: 3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.wax-seal {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #c0392b, #8b1a1a 70%);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 2px 4px rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  border: 2px solid #6b1212;
}

.seal-text {
  font-family: 'Playfair Display', serif;
  font-size: 14px;
  font-weight: 700;
  color: #f5e6d3;
  letter-spacing: 1px;
  text-align: center;
  line-height: 1.1;
}

.envelope-letter {
  position: absolute;
  top: 20px;
  left: 15px;
  right: 15px;
  height: 140px;
  background: #fffdf8;
  border-radius: 2px;
  z-index: 1;
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.letter-preview {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: #3d2b1f;
  text-align: center;
}

.hint {
  margin-top: 48px;
  font-size: 14px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(245, 230, 211, 0.6);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
