/**
 * useAutoScroll — Smooth continuous scroll with pause-on-touch.
 * Uses requestAnimationFrame for butter-smooth movement.
 */

import { ref, onUnmounted } from 'vue';

export function useAutoScroll() {
  const isRunning = ref(false);
  const isPaused = ref(false);
  let rafId: number | null = null;
  let lastTs = 0;
  let speedPxPerSec = 40; // base speed, scaled by config.speed (1-5)

  function start(speed: number = 2, stopOnTouch = true) {
    if (isRunning.value) return;
    speedPxPerSec = 20 + speed * 15; // 35 – 95 px/s
    isRunning.value = true;
    isPaused.value = false;
    lastTs = performance.now();

    const loop = (ts: number) => {
      if (!isRunning.value) return;

      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      if (!isPaused.value) {
        window.scrollBy(0, speedPxPerSec * dt);
      }

      // Stop when we reach the bottom
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= maxScroll - 2) {
        stop();
        return;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    if (stopOnTouch) {
      window.addEventListener('touchstart', onUserInteract, { passive: true });
      window.addEventListener('wheel', onUserInteract, { passive: true });
      window.addEventListener('mousedown', onUserInteract);
    }
  }

  function onUserInteract() {
    isPaused.value = true;
    // Optional: resume after 3s of inactivity
    // clearTimeout(resumeTimer);
    // resumeTimer = setTimeout(() => { isPaused.value = false; }, 3000);
  }

  function stop() {
    isRunning.value = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    window.removeEventListener('touchstart', onUserInteract);
    window.removeEventListener('wheel', onUserInteract);
    window.removeEventListener('mousedown', onUserInteract);
  }

  function pause() {
    isPaused.value = true;
  }

  function resume() {
    isPaused.value = false;
  }

  onUnmounted(stop);

  return { isRunning, isPaused, start, stop, pause, resume };
}
