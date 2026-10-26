<template>
  <div class="rsvp">
    <template v-if="!submitted">
      <input
        v-model="guestName"
        type="text"
        placeholder="Your name"
        class="input"
        maxlength="100"
      />
      <select v-model="status" class="select">
        <option value="attending">I'll be there</option>
        <option value="attending_with_partner">I'll come with a partner</option>
        <option value="declined">Sorry, can't make it</option>
      </select>
      <input
        v-if="status === 'attending_with_partner'"
        v-model="partnerName"
        type="text"
        placeholder="Partner's name"
        class="input"
        maxlength="100"
      />
      <button class="submit-btn" :disabled="!guestName || loading" @click="submit">
        {{ loading ? 'Sending…' : 'Send RSVP' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </template>
    <div v-else class="success">
      <p>Thank you, {{ guestName }}!</p>
      <p class="sub">Your response has been recorded.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps<{
  slug: string;
  options?: string[];
}>();

const guestName = ref('');
const status = ref<'attending' | 'attending_with_partner' | 'declined'>('attending');
const partnerName = ref('');
const loading = ref(false);
const submitted = ref(false);
const error = ref('');

async function submit() {
  if (!guestName.value.trim()) return;
  loading.value = true;
  error.value = '';

  try {
    await axios.post(`/api/public/i/${props.slug}/rsvp`, {
      guestName: guestName.value.trim(),
      status: status.value,
      partnerName: status.value === 'attending_with_partner' ? partnerName.value.trim() : undefined,
    });
    submitted.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Something went wrong. Please try again.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.rsvp {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  height: 100%;
  padding: 4px 0;
}

.input,
.select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d4c0a0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 15px;
  background: #fffdf8;
  color: #3d2b1f;
  outline: none;
}

.input:focus,
.select:focus {
  border-color: #3d2b1f;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #3d2b1f;
  color: #f5e6d3;
  border: none;
  border-radius: 8px;
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: #c0392b;
  font-size: 13px;
  text-align: center;
}

.success {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  gap: 6px;
}

.success p {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: #3d2b1f;
}

.success .sub {
  font-size: 14px;
  color: #8a6f5a;
}
</style>
