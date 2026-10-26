<template>
  <div
    :id="obj.id"
    class="canvas-object"
    :class="[`type-${obj.type}`, { 'has-animation': obj.animation && obj.animation.type !== 'none' }]"
    :style="objectStyle"
    ref="elRef"
  >
    <!-- TEXT -->
    <template v-if="obj.type === 'text'">
      <div class="text-content" :style="textStyle" v-html="formattedContent"></div>
    </template>

    <!-- IMAGE / SVG ORNAMENT -->
    <template v-else-if="obj.type === 'image' || obj.type === 'svg_ornament'">
      <img
        :src="obj.src"
        :alt="obj.id"
        class="media"
        draggable="false"
      />
    </template>

    <!-- VIDEO BACKGROUND -->
    <template v-else-if="obj.type === 'video_bg'">
      <video
        :src="obj.src"
        autoplay
        muted
        loop
        playsinline
        class="media"
      />
    </template>

    <!-- WIDGETS -->
    <template v-else-if="obj.type === 'widget'">
      <CountdownWidget v-if="obj.widgetType === 'countdown'" :target-date="clientData.date" />
      <MapWidget
        v-else-if="obj.widgetType === 'map'"
        :map-url="resolvedMapUrl"
        :label="obj.content || 'View on Map'"
        :style="obj.style"
      />
      <DressCodeWidget
        v-else-if="obj.widgetType === 'dress_code'"
        :colors="clientData.dressCodeColors || obj.dressCodeColors || []"
      />
      <RsvpWidget
        v-else-if="obj.widgetType === 'rsvp'"
        :slug="slug"
        :options="clientData.rsvpOptions"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CountdownWidget from './widgets/CountdownWidget.vue';
import MapWidget from './widgets/MapWidget.vue';
import DressCodeWidget from './widgets/DressCodeWidget.vue';
import RsvpWidget from './widgets/RsvpWidget.vue';

gsap.registerPlugin(ScrollTrigger);

const props = defineProps<{
  obj: any;
  clientData: Record<string, any>;
  slug: string;
}>();

const elRef = ref<HTMLElement | null>(null);

const objectStyle = computed(() => ({
  position: 'absolute' as const,
  left: `${props.obj.x}px`,
  top: `${props.obj.y}px`,
  width: `${props.obj.width}px`,
  height: `${props.obj.height}px`,
  zIndex: props.obj.zIndex ?? 1,
  opacity: props.obj.opacity ?? 1,
  transform: props.obj.rotation ? `rotate(${props.obj.rotation}deg)` : undefined,
  mixBlendMode: props.obj.blendMode || undefined,
}));

const textStyle = computed(() => {
  const s = props.obj.style || {};
  return {
    fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
    fontFamily: s.fontFamily,
    fontWeight: s.fontWeight,
    color: s.color || s.fill,
    textAlign: s.textAlign || 'center',
    letterSpacing: s.letterSpacing ? `${s.letterSpacing}px` : undefined,
    lineHeight: s.lineHeight,
    textTransform: s.textTransform,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: s.textAlign === 'left' ? 'flex-start' : s.textAlign === 'right' ? 'flex-end' : 'center',
  };
});

const formattedContent = computed(() => {
  return (props.obj.content || '').replace(/\n/g, '<br/>');
});

const resolvedMapUrl = computed(() => {
  return props.obj.mapUrl?.replace('{{mapUrl}}', props.clientData.mapUrl || '') || props.clientData.mapUrl;
});

onMounted(async () => {
  await nextTick();
  if (!elRef.value || !props.obj.animation || props.obj.animation.type === 'none') return;

  const anim = props.obj.animation;
  const el = elRef.value;

  // Initial hidden state
  const fromVars: gsap.TweenVars = { opacity: 0 };
  switch (anim.type) {
    case 'fade-up':
      fromVars.y = 40;
      break;
    case 'zoom-in':
      fromVars.scale = 0.6;
      break;
    case 'slide-left':
      fromVars.x = -60;
      break;
    case 'slide-right':
      fromVars.x = 60;
      break;
    case 'rotate-in':
      fromVars.rotation = -15;
      fromVars.scale = 0.8;
      break;
    case 'bounce':
      fromVars.y = 50;
      break;
  }

  gsap.set(el, fromVars);

  gsap.to(el, {
    opacity: props.obj.opacity ?? 1,
    x: 0,
    y: 0,
    scale: 1,
    rotation: props.obj.rotation || 0,
    duration: anim.duration || 0.8,
    delay: anim.delay || 0,
    ease: anim.ease || 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      once: true,
    },
  });
});
</script>

<style scoped>
.canvas-object {
  overflow: hidden;
}

.media {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
