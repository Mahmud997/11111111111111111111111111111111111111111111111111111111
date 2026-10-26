/**
 * useAudioUnlock — Critical strategy to bypass browser autoplay restrictions.
 *
 * iOS Safari & Chrome require a user gesture (click/touch) before any audio
 * can play. The Intro Screen is that gesture. We create an Audio element
 * and call .play() inside the same event handler that opens the envelope.
 * Once unlocked, subsequent .play() calls work even without user interaction.
 */

import { ref } from 'vue';

const audioEl = ref<HTMLAudioElement | null>(null);
const isUnlocked = ref(false);
const isPlaying = ref(false);

export function useAudioUnlock() {
  function createAudio(url: string, loop = true): HTMLAudioElement {
    const audio = new Audio(url);
    audio.loop = loop;
    audio.preload = 'auto';
    // iOS requires playsInline
    (audio as any).playsInline = true;
    audioEl.value = audio;
    return audio;
  }

  /**
   * Must be called synchronously inside a user gesture handler
   * (click / touchstart / touchend).
   */
  async function unlockAndPlay(url: string, loop = true): Promise<void> {
    if (!audioEl.value) {
      createAudio(url, loop);
    }

    const audio = audioEl.value!;
    audio.src = url;
    audio.loop = loop;

    try {
      // This call is the key — it happens inside the user gesture.
      await audio.play();
      isUnlocked.value = true;
      isPlaying.value = true;
    } catch (err) {
      console.warn('Audio unlock failed (will retry on next interaction):', err);
      // Still mark as "attempted" so UI can proceed
      isUnlocked.value = true;
    }
  }

  function pause() {
    if (audioEl.value && !audioEl.value.paused) {
      audioEl.value.pause();
      isPlaying.value = false;
    }
  }

  function resume() {
    if (audioEl.value && audioEl.value.paused && isUnlocked.value) {
      audioEl.value.play().catch(() => {});
      isPlaying.value = true;
    }
  }

  function toggle() {
    if (isPlaying.value) pause();
    else resume();
  }

  return {
    audioEl,
    isUnlocked,
    isPlaying,
    createAudio,
    unlockAndPlay,
    pause,
    resume,
    toggle,
  };
}
